import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { startDb, stopDb, clearDb } from "./setup.js";
import { app, registerAndLogin, seedProduct, auth } from "./helpers.js";

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

describe("danh sách yêu thích", () => {
    it("thêm hai lần vẫn chỉ một sản phẩm (idempotent)", async () => {
        const token = await registerAndLogin("a@test.com");
        const { product } = await seedProduct();

        await request(app).post(`/api/wishlist/${product._id}`).set(auth(token));
        await request(app).post(`/api/wishlist/${product._id}`).set(auth(token));

        const res = await request(app).get("/api/wishlist").set(auth(token));
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(res.body.data[0]._id).toBe(product._id.toString());
    });

    it("bỏ thích được, bỏ cái không có cũng không lỗi", async () => {
        const token = await registerAndLogin("b@test.com");
        const { product } = await seedProduct();
        await request(app).post(`/api/wishlist/${product._id}`).set(auth(token));

        const del1 = await request(app).delete(`/api/wishlist/${product._id}`).set(auth(token));
        const del2 = await request(app).delete(`/api/wishlist/${product._id}`).set(auth(token));
        expect(del1.status).toBe(200);
        expect(del2.status).toBe(200);

        const res = await request(app).get("/api/wishlist").set(auth(token));
        expect(res.body.data).toHaveLength(0);
    });

    it("danh sách của người này không lẫn sang người khác", async () => {
        const t1 = await registerAndLogin("c1@test.com");
        const t2 = await registerAndLogin("c2@test.com");
        const { product } = await seedProduct();
        await request(app).post(`/api/wishlist/${product._id}`).set(auth(t1));

        const res = await request(app).get("/api/wishlist").set(auth(t2));
        expect(res.body.data).toHaveLength(0);
    });

    it("sản phẩm không tồn tại bị từ chối", async () => {
        const token = await registerAndLogin("d@test.com");
        const res = await request(app)
            .post("/api/wishlist/507f1f77bcf86cd799439011")
            .set(auth(token));
        expect([400, 404]).toContain(res.status);
    });

    it("chưa đăng nhập trả 401; admin và viewer trả 403", async () => {
        const { product } = await seedProduct();
        const anon = await request(app).get("/api/wishlist");
        const admin = await registerAndLogin("admin@test.com", "admin");
        const viewer = await registerAndLogin("viewer@test.com", "viewer");

        expect(anon.status).toBe(401);
        expect((await request(app).get("/api/wishlist").set(auth(admin))).status).toBe(403);
        expect(
            (await request(app).post(`/api/wishlist/${product._id}`).set(auth(viewer))).status
        ).toBe(403);
    });
});