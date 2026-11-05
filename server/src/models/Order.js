import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    size: { type: String, required: true },
    color: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
});

const shippingAddressSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true, trim: true },
        phone: { type: String, required: true, trim: true },
        street: { type: String, required: true, trim: true },
        city: { type: String, required: true, trim: true },
    },
    { _id: false }
);

const orderSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        items: { type: [orderItemSchema], required: true },
        shippingAddress: { type: shippingAddressSchema, required: true },
        paymentMethod: { type: String, enum: ["COD"], default: "COD" },
        paymentStatus: { type: String, enum: ["unpaid", "paid"], default: "unpaid" },
        status: {
            type: String,
            enum: ["pending", "shipping", "completed", "cancelled"],
            default: "pending",
        },
        totalPrice: { type: Number, required: true, min: 0 },
        note: { type: String, trim: true, maxlength: 500, default: "" },
    },
    { timestamps: true }
);

orderSchema.index({ user: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

export default Order;