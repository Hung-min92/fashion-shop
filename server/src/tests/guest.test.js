import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { startDb, stopDb, clearDb } from "./setup.js";
import { app, Product, registerAndLogin, seedProduct, auth } from "./helpers.js";

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

const shippingAddress = {
    fullName: "Tran Thi B",
    phone: "0912345678",
    street: "2 Hai Ba Trung",
    city: "TP HCM",
};

const line = (item, quantity = 1) => ({
    productId: item.product._id.toString(),
    sku: item.sku,
    quantity,
});

const guestOrder = (items, extra = {}) =>
    request(app)
        .post("/api/orders/guest")
        .send({ items, shippingAddress, note: "", ...extra });

const stockOf = async (item) =>
    (await Product.findById(item.product._id)).variants[0].stock;

describe("đặt hàng không cần tài khoản", () => {
    it("đặt thành công: trừ kho, giá do backend tính, có mã đơn, chờ xử lý", async () => {
        const item = await seedProduct(10);
        const res = await guestOrder([{ ...line(item, 2), price: 1 }], { totalPrice: 1 });

        expect(res.status).toBe(201);
        expect(res.body.data.totalPrice).toBe(200000);
        expect(res.body.data.status).toBe("pending");
        expect(res.body.data.isGuest).toBe(true);
        expect(res.body.data.orderCode).toMatch(/^GS-[A-Z2-9]{8}$/);
        expect(await stockOf(item)).toBe(8);
    });

    it("hai dòng trùng sản phẩm được gộp, kho chỉ trừ đúng tổng", async () => {
        const item = await seedProduct(10);
        const res = await guestOrder([line(item, 2), line(item, 3)]);

        expect(res.status).toBe(201);
        expect(res.body.data.items).toHaveLength(1);
        expect(res.body.data.items[0].quantity).toBe(5);
        expect(await stockOf(item)).toBe(5);
    });

    it("hết hàng thì từ chối và không trừ kho", async () => {
        const item = await seedProduct(2);
        const res = await guestOrder([line(item, 3)]);
        expect(res.status).toBe(400);
        expect(await stockOf(item)).toBe(2);
    });

    it("hai khách mua cùng lúc món chỉ còn 1: chỉ một đơn thành công", async () => {
        const item = await seedProduct(1);
        const [a, b] = await Promise.all([
            guestOrder([line(item)]),
            guestOrder([line(item)]),
        ]);
        expect([a.status, b.status].sort()).toEqual([201, 400]);
        expect(await stockOf(item)).toBe(0);
    });

    it("dữ liệu sai bị từ chối: số điện thoại, giỏ trống, ID sản phẩm", async () => {
        const item = await seedProduct(5);
        const badPhone = await guestOrder([line(item)], {
            shippingAddress: { ...shippingAddress, phone: "123" },
        });
        const empty = await guestOrder([]);
        const badId = await guestOrder([{ productId: "abc", sku: "X", quantity: 1 }]);

        expect(badPhone.status).toBe(400);
        expect(empty.status).toBe(400);
        expect(badId.status).toBe(400);
        expect(await stockOf(item)).toBe(5);
    });
});

describe("tra cứu và hủy đơn khách vãng lai", () => {
    it("tra cứu đúng bằng mã (chữ thường cũng được) và số điện thoại (có dấu cách)", async () => {
        const item = await seedProduct(5);
        const created = await guestOrder([line(item)]);
        const code = created.body.data.orderCode;

        const res = await request(app)
            .post("/api/orders/lookup")
            .send({ code: code.toLowerCase(), phone: "0912 345 678" });

        expect(res.status).toBe(200);
        expect(res.body.data.orderCode).toBe(code);
    });

    it("sai số điện thoại hoặc sai mã đều trả 404 giống nhau", async () => {
        const item = await seedProduct(5);
        const created = await guestOrder([line(item)]);
        const code = created.body.data.orderCode;

        const wrongPhone = await request(app)
            .post("/api/orders/lookup")
            .send({ code, phone: "0900000000" });
        const wrongCode = await request(app)
            .post("/api/orders/lookup")
            .send({ code: "GS-AAAAAAAA", phone: "0912345678" });

        expect(wrongPhone.status).toBe(404);
        expect(wrongCode.status).toBe(404);
        expect(wrongPhone.body.message).toBe(wrongCode.body.message);
    });

    it("đơn của thành viên không tra cứu được bằng mã + số điện thoại", async () => {
        const token = await registerAndLogin("m@test.com");
        const item = await seedProduct(5);
        await request(app)
            .post("/api/cart/items")
            .set(auth(token))
            .send(line(item));
        const created = await request(app)
            .post("/api/orders")
            .set(auth(token))
            .send({
                shippingAddress: { fullName: "A", phone: "0901234567", street: "1", city: "HN" },
            });
        expect(created.body.data.orderCode).toMatch(/^GS-[A-Z2-9]{8}$/);

        const res = await request(app)
            .post("/api/orders/lookup")
            .send({ code: created.body.data.orderCode, phone: "0901234567" });
        expect(res.status).toBe(404);
    });

    it("hủy đơn hoàn kho đúng một lần", async () => {
        const item = await seedProduct(10);
        const created = await guestOrder([line(item, 3)]);
        const body = { code: created.body.data.orderCode, phone: "0912345678" };
        expect(await stockOf(item)).toBe(7);

        const first = await request(app).post("/api/orders/guest-cancel").send(body);
        const second = await request(app).post("/api/orders/guest-cancel").send(body);

        expect(first.status).toBe(200);
        expect(first.body.data.status).toBe("cancelled");
        expect(second.status).toBe(400);
        expect(await stockOf(item)).toBe(10);
    });

    it("hủy sai số điện thoại bị từ chối, đơn không đổi", async () => {
        const item = await seedProduct(10);
        const created = await guestOrder([line(item, 3)]);

        const res = await request(app)
            .post("/api/orders/guest-cancel")
            .send({ code: created.body.data.orderCode, phone: "0900000000" });

        expect(res.status).toBe(404);
        expect(await stockOf(item)).toBe(7);
    });
});

describe("admin và viewer với đơn khách vãng lai", () => {
    it("admin thấy đơn khách trong danh sách và mở được chi tiết", async () => {
        const item = await seedProduct(5);
        const created = await guestOrder([line(item)]);
        const admin = await registerAndLogin("admin@test.com", "admin");

        const list = await request(app).get("/api/admin/orders").set(auth(admin));
        const detail = await request(app)
            .get(`/api/orders/${created.body.data._id}`)
            .set(auth(admin));

        expect(list.status).toBe(200);
        expect(list.body.data[0].isGuest).toBe(true);
        expect(list.body.data[0].user ?? null).toBeNull();
        expect(JSON.stringify(list.body)).toContain("0912345678");
        expect(detail.status).toBe(200);
    });

    it("viewer bị che số điện thoại của đơn khách", async () => {
        const item = await seedProduct(5);
        await guestOrder([line(item)]);
        const viewer = await registerAndLogin("viewer@test.com", "viewer");

        const res = await request(app).get("/api/admin/orders").set(auth(viewer));
        expect(res.status).toBe(200);
        expect(JSON.stringify(res.body)).not.toContain("0912345678");
    });
});

describe("xem trước giỏ hàng của khách", () => {
    it("trả giá và tồn kho hiện tại, SKU viết thường vẫn nhận", async () => {
        const item = await seedProduct(10);
        const res = await request(app)
            .post("/api/cart/preview")
            .send({
                items: [{ ...line(item, 2), sku: item.sku.toLowerCase() }],
            });

        expect(res.status).toBe(200);
        expect(res.body.data.items[0].available).toBe(true);
        expect(res.body.data.items[0].stock).toBe(10);
        expect(res.body.data.totalPrice).toBe(200000);
    });

    it("ID sản phẩm sai bị từ chối (400)", async () => {
        const res = await request(app)
            .post("/api/cart/preview")
            .send({ items: [{ productId: "khong-hop-le", sku: "X", quantity: 1 }] });
        expect(res.status).toBe(400);
    });
});