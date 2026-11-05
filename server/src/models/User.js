import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
});

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Tên là bắt buộc"],
            trim: true,
            maxlength: 100,
        },
        email: {
            type: String,
            required: [true, "Email là bắt buộc"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        passwordHash: {
            type: String,
            required: true,
            select: false,
        },
        phone: { type: String, trim: true },
        role: {
            type: String,
            enum: ["customer", "admin"],
            default: "customer",
        },
        isActive: { type: Boolean, default: true },
        addresses: [addressSchema],
    },
    { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;