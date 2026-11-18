import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import request from "supertest";
import { startDb, stopDb, clearDb } from "./setup.js";
import { app, User, registerAndLogin, seedProduct, auth, address } from "./helpers.js";

const { default: EmailToken } = await import("../models/EmailToken.js");
const { createToken } = await import("../utils/emailToken.js");

beforeAll(startDb);
afterAll(stopDb);
beforeEach(clearDb);

async function newUser(email, opts) {
    const token = await registerAndLogin(email, "customer", opts);
    const user = await User.findOne({ email });
    return { token, user };
}

describe("xác minh email", () => {
    it("đăng ký xong chưa xác minh", async () => {
        const { user } = await newUser("a@test.com", { verified: false });
        expect(user.emailVerified).toBe(false);
    });

    it("chưa xác minh vẫn đặt hàng được (không cản trở khách mới)", async () => {
        const { token } = await newUser("b@test.com", { verified: false });
        const { product, sku } = await seedProduct(5);
        await request(app)
            .post("/api/cart/items")
            .set(auth(token))
            .send({ productId: product._id.toString(), sku, quantity: 1 });

        const res = await request(app)
            .post("/api/orders")
            .set(auth(token))
            .send({ shippingAddress: address });

        expect(res.status).toBe(201);
    });

    it("mã đúng thì xác minh được, dùng lại lần hai bị từ chối", async () => {
        const { user } = await newUser("c@test.com", { verified: false });
        const raw = await createToken(user._id, "verify");

        const first = await request(app).post("/api/auth/verify-email").send({ token: raw });
        const second = await request(app).post("/api/auth/verify-email").send({ token: raw });

        expect(first.status).toBe(200);
        expect(second.status).toBe(400);
        expect((await User.findById(user._id)).emailVerified).toBe(true);
    });

    it("mã sai hoặc hết hạn bị từ chối", async () => {
        const { user } = await newUser("d@test.com", { verified: false });
        const raw = await createToken(user._id, "verify");
        await EmailToken.updateOne({ user: user._id }, { $set: { expiresAt: new Date(Date.now() - 1000) } });

        const expired = await request(app).post("/api/auth/verify-email").send({ token: raw });
        const garbage = await request(app).post("/api/auth/verify-email").send({ token: "abc" });

        expect(expired.status).toBe(400);
        expect(garbage.status).toBe(400);
        expect((await User.findById(user._id)).emailVerified).toBe(false);
    });

    it("gửi lại liên tục bị chặn (429)", async () => {
        const { token } = await newUser("e@test.com", { verified: false });
        // đăng ký đã tạo một mã ngay trước đó, nên lần gửi lại đầu cũng bị chặn
        const res = await request(app).post("/api/auth/resend-verification").set(auth(token));
        expect(res.status).toBe(429);
    });
});

describe("quên mật khẩu", () => {
    it("trả cùng một phản hồi dù email có tồn tại hay không", async () => {
        await newUser("f@test.com");
        const known = await request(app).post("/api/auth/forgot-password").send({ email: "f@test.com" });
        const unknown = await request(app).post("/api/auth/forgot-password").send({ email: "khong-co@test.com" });

        expect(known.status).toBe(200);
        expect(unknown.status).toBe(200);
        expect(known.body.message).toBe(unknown.body.message);
    });

    it("đặt lại mật khẩu: mật khẩu mới dùng được, cũ hết tác dụng, mã dùng một lần", async () => {
        const { user } = await newUser("g@test.com");
        const raw = await createToken(user._id, "reset");

        const reset = await request(app)
            .post("/api/auth/reset-password")
            .send({ token: raw, password: "matkhaumoi123" });
        const reuse = await request(app)
            .post("/api/auth/reset-password")
            .send({ token: raw, password: "khacnua12345" });
        const loginNew = await request(app)
            .post("/api/auth/login")
            .send({ email: "g@test.com", password: "matkhaumoi123" });
        const loginOld = await request(app)
            .post("/api/auth/login")
            .send({ email: "g@test.com", password: "matkhau123" });

        expect(reset.status).toBe(200);
        expect(reuse.status).toBe(400);
        expect(loginNew.status).toBe(200);
        expect(loginOld.status).toBe(401);
    });

    it("mật khẩu mới quá ngắn bị từ chối và mã vẫn dùng được", async () => {
        const { user } = await newUser("h@test.com");
        const raw = await createToken(user._id, "reset");

        const short = await request(app).post("/api/auth/reset-password").send({ token: raw, password: "123" });
        const ok = await request(app).post("/api/auth/reset-password").send({ token: raw, password: "matkhaumoi123" });

        expect(short.status).toBe(400);
        expect(ok.status).toBe(200);
    });
});