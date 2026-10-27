import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

// --- Kiểm tra biến môi trường ---
const { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME = "Admin" } = process.env;

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  console.error("❌ Thiếu ADMIN_EMAIL hoặc ADMIN_PASSWORD trong file .env");
  process.exit(1);
}

if (ADMIN_PASSWORD.length < 8) {
  console.error("❌ ADMIN_PASSWORD phải có ít nhất 8 ký tự");
  process.exit(1);
}

// --- Kết nối DB ---
await connectDB();

// --- Kiểm tra email đã tồn tại chưa ---
const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });

if (existing) {
  if (existing.role === "admin") {
    console.log("⚠️  Tài khoản admin với email này đã tồn tại:", existing.email);
  } else {
    // Nâng quyền user thường lên admin
    existing.role = "admin";
    await existing.save();
    console.log("✅ Đã nâng quyền tài khoản lên admin:", existing.email);
  }
  await mongoose.disconnect();
  process.exit(0);
}

// --- Băm mật khẩu ---
const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

// --- Tạo admin ---
const admin = await User.create({
  name: ADMIN_NAME,
  email: ADMIN_EMAIL.toLowerCase(),
  passwordHash,
  role: "admin",
});

console.log("✅ Tạo admin thành công!");
console.log("   Tên   :", admin.name);
console.log("   Email :", admin.email);
console.log("   Role  :", admin.role);
console.log("   ID    :", admin._id);

await mongoose.disconnect();
console.log("🔌 Đã ngắt kết nối MongoDB");
