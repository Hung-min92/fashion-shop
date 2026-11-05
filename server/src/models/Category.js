import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Tên danh mục là bắt buộc"],
            unique: true,
            trim: true,
            maxlength: 100,
        },
        slug: {
            type: String,
            required: [true, "Slug là bắt buộc"],
            unique: true,
            lowercase: true,
            trim: true,
        },
    },
    { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);

export default Category;