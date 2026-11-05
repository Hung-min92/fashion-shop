import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

await connectDB();

await Product.deleteMany({});
await Category.deleteMany({});

const [tee, jeans] = await Category.create([
    { name: "Áo thun", slug: "ao-thun" },
    { name: "Quần jean", slug: "quan-jean" },
]);

const sizes = ["S", "M", "L"];
const colors = ["Đen", "Trắng"];

function makeVariants(prefix) {
    const list = [];
    for (const size of sizes) {
        for (const color of colors) {
            list.push({
                sku: `${prefix}-${size}-${color === "Đen" ? "DEN" : "TRANG"}`,
                size,
                color,
                stock: 10,
            });
        }
    }
    return list;
}

const products = [];
for (let i = 1; i <= 12; i++) {
    products.push({
        name: `Áo thun mẫu ${i}`,
        description: `Áo thun cotton mẫu số ${i}`,
        price: 150000 + i * 10000,
        category: tee._id,
        variants: makeVariants(`AT${i}`),
    });
}
for (let i = 1; i <= 8; i++) {
    products.push({
        name: `Quần jean mẫu ${i}`,
        description: `Quần jean mẫu số ${i}`,
        price: 350000 + i * 20000,
        category: jeans._id,
        variants: makeVariants(`QJ${i}`),
    });
}

await Product.create(products);
console.log(`Đã tạo ${products.length} sản phẩm mẫu`);

await mongoose.disconnect();