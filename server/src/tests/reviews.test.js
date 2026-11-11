import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { startDb, stopDb, clearDb } from "./setup.js";
import {
    app, Product, registerAndLogin, seedProduct, buyAndComplete, auth,
} from "./helpers.js";

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

const reviewUrl = (product) => `/api/products/${product._id}/reviews`;
const body = (rating) => ({ rating, comment: "Áo đẹp, mặc rất vừa vặn" });

describe("đánh giá sản phẩm", () => {
    it("người chưa mua không được đánh giá", async () => {
        const token = await registerAndLogin("a@test.com");
        const { product } = await seedProduct();

        const res = await request(app)
            .post(reviewUrl(product))
            .set(auth(token))
            .send(body(5));

        expect([400, 403]).toContain(res.status);
        expect((await Product.findById(product._id)).ratingCount).toBe(0);
    });

    it("đơn chưa hoàn thành (pending) vẫn không được đánh giá", async () => {
        const token = await registerAndLogin("b@test.com");
        const item = await seedProduct();
        await request(app)
            .post("/api/cart/items")
            .set(auth(token))
            .send({ productId: item.product._id.toString(), sku: item.sku, quantity: 1 });
        await request(app)
            .post("/api/orders")
            .set(auth(token))
            .send({ shippingAddress: { fullName: "A", phone: "0901234567", street: "1", city: "HN" } });

        const res = await request(app)
            .post(reviewUrl(item.product))
            .set(auth(token))
            .send(body(5));
        expect([400, 403]).toContain(res.status);
    });

    it("người đã mua đánh giá được, mỗi người chỉ một lần", async () => {
        const token = await registerAndLogin("c@test.com");
        const item = await seedProduct();
        await buyAndComplete(token, item);

        const first = await request(app)
            .post(reviewUrl(item.product))
            .set(auth(token))
            .send(body(5));
        const second = await request(app)
            .post(reviewUrl(item.product))
            .set(auth(token))
            .send(body(4));

        expect(first.status).toBe(201);
        expect([400, 409]).toContain(second.status);
        expect((await Product.findById(item.product._id)).ratingCount).toBe(1);
    });

    it("điểm trung bình và số lượt cập nhật đúng sau khi thêm, sửa, xóa", async () => {
        const t1 = await registerAndLogin("d1@test.com");
        const t2 = await registerAndLogin("d2@test.com");
        const item = await seedProduct(10);
        await buyAndComplete(t1, item);
        await buyAndComplete(t2, item);

        const r1 = await request(app).post(reviewUrl(item.product)).set(auth(t1)).send(body(5));
        const r2 = await request(app).post(reviewUrl(item.product)).set(auth(t2)).send(body(3));

        let p = await Product.findById(item.product._id);
        expect(p.ratingCount).toBe(2);
        expect(p.ratingAverage).toBe(4);

        // sửa: 3 -> 1  => trung bình (5+1)/2 = 3
        const upd = await request(app)
            .put(`/api/reviews/${r2.body.data._id}`)
            .set(auth(t2))
            .send(body(1));
        expect(upd.status).toBe(200);
        p = await Product.findById(item.product._id);
        expect(p.ratingAverage).toBe(3);

        // xóa review của t2 => còn 1 lượt điểm 5
        const del = await request(app)
            .delete(`/api/reviews/${r2.body.data._id}`)
            .set(auth(t2));
        expect(del.status).toBe(200);
        p = await Product.findById(item.product._id);
        expect(p.ratingCount).toBe(1);
        expect(p.ratingAverage).toBe(5);
        expect(r1.status).toBe(201);
    });

    it("không sửa/xóa được đánh giá của người khác", async () => {
        const owner = await registerAndLogin("e1@test.com");
        const other = await registerAndLogin("e2@test.com");
        const item = await seedProduct();
        await buyAndComplete(owner, item);
        const created = await request(app)
            .post(reviewUrl(item.product))
            .set(auth(owner))
            .send(body(5));
        const id = created.body.data._id;

        const upd = await request(app).put(`/api/reviews/${id}`).set(auth(other)).send(body(1));
        const del = await request(app).delete(`/api/reviews/${id}`).set(auth(other));

        expect([403, 404]).toContain(upd.status);
        expect([403, 404]).toContain(del.status);
        expect((await Product.findById(item.product._id)).ratingCount).toBe(1);
    });

    it("rating ngoài 1–5 bị từ chối", async () => {
        const token = await registerAndLogin("f@test.com");
        const item = await seedProduct();
        await buyAndComplete(token, item);

        const res = await request(app)
            .post(reviewUrl(item.product))
            .set(auth(token))
            .send(body(9));
        expect(res.status).toBe(400);
    });
});