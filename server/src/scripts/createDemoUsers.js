import "dotenv/config";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

// Mật khẩu này sẽ công khai trong README nên đừng dùng lại ở bất cứ đâu khác.
const DEMO_USERS = [
    {
        name: "Demo Viewer",
        email: "viewer.demo@example.com",
        password: "DemoViewer2026",
        role: "viewer",
    },
    {
        name: "Demo Customer",
        email: "customer.demo@example.com",
        password: "DemoCustomer2026",
        role: "customer",
    },
];

await connectDB();

for (const u of DEMO_USERS) {
    const passwordHash = await bcrypt.hash(u.password, 10);
    await User.findOneAndUpdate(
        { email: u.email },
        { $set: { name: u.name, passwordHash, role: u.role } },
        { upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    console.log(`OK: ${u.email} (${u.role})`);
}

await mongoose.disconnect();