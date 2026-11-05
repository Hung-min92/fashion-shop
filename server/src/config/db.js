import dns from "node:dns";
import mongoose from "mongoose";

// Dùng DNS của Google và Cloudflare để tra cứu SRV (khắc phục lỗi querySrv ECONNREFUSED)
dns.setServers(["8.8.8.8", "1.1.1.1"]);

export async function connectDB() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error("Thiếu MONGODB_URI trong file .env");
    }

    await mongoose.connect(uri);
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
}