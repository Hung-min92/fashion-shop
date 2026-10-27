import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

await connectDB();

// 1. Tạo Category tạm để gán cho Product
const category = await Category.create({ name: "Test Category", slug: "test-category" });
console.log("✅ Đã tạo category tạm:", category.name);

// 2. Tạo Product mẫu
const created = await Product.create({
  name: "Áo Thun Basic",
  description: "Áo thun cotton thoáng mát",
  price: -4,
  images: ["https://example.com/ao-thun.jpg"],
  category: category._id,
  variants: [
    { sku: "AT-S-TRANG", size: "S", color: "Trắng", stock: 50 },
    { sku: "AT-M-DEN",   size: "M", color: "Đen",   stock: 30 },
  ],
});
console.log("✅ Đã tạo sản phẩm:", created.name, "| Giá:", created.price);
console.log("   Variants:", created.variants.length, "loại");

// 3. Đọc lại từ DB (populate category)
const found = await Product.findById(created._id).populate("category", "name");
console.log("✅ Tìm thấy:", found.name, "| Danh mục:", found.category.name);

// 4. Cập nhật giá
const updated = await Product.findByIdAndUpdate(
  created._id,
  { price: 249000 },
  { new: true }
);
console.log("✅ Đã cập nhật giá:", updated.price);

// 5. Đếm tổng số sản phẩm
const count = await Product.countDocuments();
console.log("✅ Tổng số sản phẩm trong DB:", count);

// 6. Xóa sản phẩm và category tạm
await Product.deleteOne({ _id: created._id });
await Category.deleteOne({ _id: category._id });
console.log("✅ Đã dọn dẹp dữ liệu thử");

await mongoose.disconnect();
console.log("🔌 Đã ngắt kết nối MongoDB");
