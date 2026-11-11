process.env.JWT_SECRET = "test-secret";
process.env.JWT_EXPIRES_IN = "1h";

import request from "supertest";

export const { default: app } = await import("../app.js");
export const { default: Product } = await import("../models/Product.js");
export const { default: Category } = await import("../models/Category.js");
export const { default: Order } = await import("../models/Order.js");
export const { default: User } = await import("../models/User.js");

export const address = {
    fullName: "Nguyen Van A",
    phone: "0901234567",
    street: "1 Le Loi",
    city: "Ha Noi",
};

// role mặc định là customer; admin/viewer được gán thẳng vào DB rồi mới đăng nhập
export async function registerAndLogin(email, role = "customer") {
    await request(app)
        .post("/api/auth/register")
        .send({ name: "Test", email, password: "matkhau123" });
    if (role !== "customer") {
        await User.updateOne({ email }, { $set: { role } });
    }
    const res = await request(app)
        .post("/api/auth/login")
        .send({ email, password: "matkhau123" });
    return res.body.token;
}

let counter = 0;

// sku khác nhau cho mỗi sản phẩm để không đụng nhau
export async function seedProduct(stock = 10, name = "Áo test") {
    counter += 1;
    const category =
        (await Category.findOne({ slug: "ao" })) ||
        (await Category.create({ name: "Áo", slug: "ao" }));
    const sku = `T-M-DEN-${counter}`;
    const product = await Product.create({
        name: `${name} ${counter}`,
        price: 100000,
        category: category._id,
        variants: [{ sku, size: "M", color: "Đen", stock }],
    });
    return { product, sku };
}

// Mua hàng qua API thật rồi chuyển đơn sang completed (đủ điều kiện đánh giá)
export async function buyAndComplete(token, { product, sku }) {
    await request(app)
        .post("/api/cart/items")
        .set("Authorization", `Bearer ${token}`)
        .send({ productId: product._id.toString(), sku, quantity: 1 });
    const res = await request(app)
        .post("/api/orders")
        .set("Authorization", `Bearer ${token}`)
        .send({ shippingAddress: address });
    await Order.updateOne({ _id: res.body.data._id }, { $set: { status: "completed" } });
    return res.body.data._id;
}

export const auth = (token) => ({ Authorization: `Bearer ${token}` });