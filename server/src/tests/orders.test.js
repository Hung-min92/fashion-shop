import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { startDb, stopDb, clearDb } from "./setup.js";

process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRES_IN = "1h";

const { default: app } = await import("../app.js");
const { default: Product } = await import("../models/Product.js");
const { default: Category } = await import("../models/Category.js");
const { default: Order } = await import("../models/Order.js");

const address = {
    fullName: "Nguyen Van A",
    phone: "0901234567",
    street: "1 Le Loi",
    city: "Ha Noi",
};

async function registerAndLogin(email) {
    await request(app)
        .post("/api/auth/register")
        .send({ name: "Test", email, password: "matkhau123" });
    const res = await request(app)
        .post("/api/auth/login")
        .send({ email, password: "matkhau123" });
    return res.body.token;
}

async function seedProduct(stock) {
    const category = await Category.create({ name: "Áo", slug: "ao" });
    return Product.create({
        name: "Áo test",
        price: 100000,
        category: category._id,
        variants: [{ sku: "T-M-DEN", size: "M", color: "Đen", stock }],
    });
}

async function addToCart(token, product, quantity) {
    return request(app)
        .post("/api/cart/items")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: product._id.toString(), sku: "T-M-DEN", quantity });
}

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

describe("đăng nhập", () => {
    it("sai mật khẩu trả 401", async () => {
        await registerAndLogin("a@test.com");
        const res = await request(app)
            .post("/api/auth/login")
            .send({ email: "a@test.com", password: "saisaisai1" });
        expect(res.status).toBe(401);
    });

    it("không token gọi /me trả 401", async () => {
        const res = await request(app).get("/api/auth/me");
        expect(res.status).toBe(401);
    });
});

describe("đặt hàng", () => {
    it("đặt thành công: trừ kho, giá do backend tính, xóa giỏ", async () => {
        const token = await registerAndLogin("b@test.com");
        const product = await seedProduct(10);
        await addToCart(token, product, 3);

        const res = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${token}`)
            .send({ shippingAddress: address, totalPrice: 1, status: "completed" });

        expect(res.status).toBe(201);
        expect(res.body.data.totalPrice).toBe(300000);
        expect(res.body.data.status).toBe("pending");

        const after = await Product.findById(product._id);
        expect(after.variants[0].stock).toBe(7);
    });

    it("hết hàng thì từ chối và không trừ kho", async () => {
        const token = await registerAndLogin("c@test.com");
        const product = await seedProduct(5);
        await addToCart(token, product, 4);
        await Product.updateOne(
            { _id: product._id },
            { $set: { "variants.0.stock": 2 } }
        );

        const res = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${token}`)
            .send({ shippingAddress: address });

        expect(res.status).toBe(400);
        const after = await Product.findById(product._id);
        expect(after.variants[0].stock).toBe(2);
    });

    it("hai người mua cùng lúc món chỉ còn 1: chỉ một đơn thành công", async () => {
        const t1 = await registerAndLogin("d1@test.com");
        const t2 = await registerAndLogin("d2@test.com");
        const product = await seedProduct(1);
        await addToCart(t1, product, 1);
        await addToCart(t2, product, 1);

        const [r1, r2] = await Promise.all(
            [t1, t2].map((t) =>
                request(app)
                    .post("/api/orders")
                    .set("Authorization", `Bearer ${t}`)
                    .send({ shippingAddress: address })
            )
        );

        expect([r1.status, r2.status].sort()).toEqual([201, 400]);
        const after = await Product.findById(product._id);
        expect(after.variants[0].stock).toBe(0);
    });
});

describe("hủy đơn và phân quyền", () => {
    it("hủy đơn hoàn kho đúng một lần", async () => {
        const token = await registerAndLogin("e@test.com");
        const product = await seedProduct(10);
        await addToCart(token, product, 4);
        const created = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${token}`)
            .send({ shippingAddress: address });
        const id = created.body.data._id;

        const first = await request(app)
            .patch(`/api/orders/${id}/cancel`)
            .set("Authorization", `Bearer ${token}`);
        const second = await request(app)
            .patch(`/api/orders/${id}/cancel`)
            .set("Authorization", `Bearer ${token}`);

        expect(first.status).toBe(200);
        expect(second.status).toBe(400);
        const after = await Product.findById(product._id);
        expect(after.variants[0].stock).toBe(10);
    });

    it("khách không xem được đơn của người khác (404)", async () => {
        const t1 = await registerAndLogin("f1@test.com");
        const t2 = await registerAndLogin("f2@test.com");
        const product = await seedProduct(10);
        await addToCart(t1, product, 1);
        const created = await request(app)
            .post("/api/orders")
            .set("Authorization", `Bearer ${t1}`)
            .send({ shippingAddress: address });

        const res = await request(app)
            .get(`/api/orders/${created.body.data._id}`)
            .set("Authorization", `Bearer ${t2}`);
        expect(res.status).toBe(404);
    });

    it("khách gọi API admin trả 403", async () => {
        const token = await registerAndLogin("g@test.com");
        const res = await request(app)
            .get("/api/admin/orders")
            .set("Authorization", `Bearer ${token}`);
        expect(res.status).toBe(403);
    });
});