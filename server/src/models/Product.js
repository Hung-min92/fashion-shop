import mongoose from "mongoose";

const variantSchema = new mongoose.Schema({
    sku: {
        type: String,
        required: [true, "SKU là bắt buộc"],
        trim: true,
        uppercase: true,
    },
    size: { type: String, required: [true, "Size là bắt buộc"], trim: true },
    color: { type: String, required: [true, "Màu là bắt buộc"], trim: true },
    stock: {
        type: Number,
        required: true,
        min: [0, "Tồn kho không được âm"],
        default: 0,
    },
});

const productSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Tên sản phẩm là bắt buộc"],
            trim: true,
            maxlength: 150,
        },
        description: { type: String, trim: true, default: "" },
        price: {
            type: Number,
            required: [true, "Giá là bắt buộc"],
            min: [0, "Giá không được âm"],
        },
        images: [{ type: String }],
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: [true, "Danh mục là bắt buộc"],
        },
        variants: [variantSchema],
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

const Product = mongoose.model("Product", productSchema);

export default Product;