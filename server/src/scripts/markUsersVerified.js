import dns from "node:dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import "dotenv/config";
import mongoose from "mongoose";
import User from "../models/User.js";

await mongoose.connect(process.env.MONGODB_URI);
console.log("Đang làm việc với database:", mongoose.connection.name);

const result = await User.updateMany(
    { emailVerified: { $exists: false } },
    { $set: { emailVerified: true } }
);
console.log(`Đã cập nhật ${result.modifiedCount} tài khoản.`);

await mongoose.disconnect();