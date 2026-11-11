import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        rating: {
            type: Number,
            required: true,
            min: [1, "Tối thiểu 1 sao"],
            max: [5, "Tối đa 5 sao"],
        },
        comment: { type: String, trim: true, maxlength: 1000, default: "" },
    },
    { timestamps: true }
);

// Mỗi người chỉ đánh giá một sản phẩm một lần
reviewSchema.index({ user: 1, product: 1 }, { unique: true });
// Lấy danh sách đánh giá của một sản phẩm, mới nhất trước
reviewSchema.index({ product: 1, createdAt: -1 });

const Review = mongoose.model("Review", reviewSchema);

export default Review;