import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import Category from "../models/Category.js";

await connectDB();

const created = await Category.create({ name: "Áo thun", slug: "Ao-Thun" });
console.log("Đã tạo:", created);

const all = await Category.find();
console.log("Số danh mục hiện có:", all.length);

await Category.deleteOne({ _id: created._id });
console.log("Đã xóa danh mục thử");

await mongoose.disconnect();