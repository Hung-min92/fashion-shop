import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { startDb, stopDb, clearDb } from "./setup.js";
import {
    app, Order, registerAndLogin, seedProduct, buyAndComplete, auth, address,
} from "./helpers.js";

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

describe("viewer (admin chỉ xem)", () => {
    it("xem được danh sách đơn nhưng thông tin cá nhân bị che", async () => {
        const customer = await registerAndLogin("khach@test.com");
        const viewer = await registerAndLogin("viewer@test.com", "viewer");
        const item = await seedProduct();
        await buyAndComplete(customer, item);

        const res = await request(app).get("/api/admin/orders").set(auth(viewer));

        expect(res.status).toBe(200);
        const raw = JSON.stringify(res.body);
        expect(raw).not.toContain(address.phone);
        expect(raw).not.toContain(address.street);
    });

    it("không đổi được trạng thái đơn (403) và đơn không bị thay đổi", async () => {
        const customer = await registerAndLogin("khach@test.com");
        const viewer = await registerAndLogin("viewer@test.com", "viewer");
        const item = await seedProduct();
        const orderId = await buyAndComplete(customer, item);
        await Order.updateOne({ _id: orderId }, { $set: { status: "pending" } });

        const res = await request(app)
            .patch(`/api/admin/orders/${orderId}/status`)
            .set(auth(viewer))
            .send({ status: "shipping" });

        expect(res.status).toBe(403);
        expect((await Order.findById(orderId)).status).toBe("pending");
    });

    it("admin thật thì thấy đầy đủ số điện thoại", async () => {
        const customer = await registerAndLogin("khach@test.com");
        const admin = await registerAndLogin("admin@test.com", "admin");
        const item = await seedProduct();
        await buyAndComplete(customer, item);

        const res = await request(app).get("/api/admin/orders").set(auth(admin));
        expect(res.status).toBe(200);
        expect(JSON.stringify(res.body)).toContain(address.phone);
    });
});

describe("thống kê admin", () => {
    it("chưa đăng nhập 401, khách 403, admin và viewer 200", async () => {
        const customer = await registerAndLogin("khach@test.com");
        const admin = await registerAndLogin("admin@test.com", "admin");
        const viewer = await registerAndLogin("viewer@test.com", "viewer");

        const get = (t) => {
            const r = request(app).get("/api/admin/stats?days=7");
            return t ? r.set(auth(t)) : r;
        };

        expect((await get()).status).toBe(401);
        expect((await get(customer)).status).toBe(403);
        expect((await get(admin)).status).toBe(200);
        expect((await get(viewer)).status).toBe(200);
    });
});