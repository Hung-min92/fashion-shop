import mongoose from "mongoose";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import Review from "../models/Review.js";
import User from "../models/User.js"; // cần để populate("user") hoạt động
import {
    createReviewSchema,
    updateReviewSchema,
    listReviewsSchema,
} from "../validators/reviewValidator.js";

// "Nguyễn Văn An" -> "Nguyễn V. A."
function displayName(name) {
    if (!name) return "Ẩn danh";
    const [first, ...rest] = name.trim().split(/\s+/);
    return [first, ...rest.map((w) => `${w[0]}.`)].join(" ");
}

// Tính lại điểm trung bình và số đánh giá, lưu vào Product
async function refreshRating(productId) {
    const [stat] = await Review.aggregate([
        { $match: { product: new mongoose.Types.ObjectId(productId) } },
        { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);
    await Product.updateOne(
        { _id: productId },
        {
            ratingAverage: stat ? Math.round(stat.avg * 10) / 10 : 0,
            ratingCount: stat ? stat.count : 0,
        }
    );
}

// Đã mua và nhận hàng sản phẩm này chưa
function hasPurchased(userId, productId) {
    return Order.exists({
        user: userId,
        status: "completed",
        "items.product": productId,
    });
}

export async function listReviews(req, res) {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }
    const parsed = listReviewsSchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
    }
    const { page, limit } = parsed.data;

    const [reviews, totalItems] = await Promise.all([
        Review.find({ product: productId })
            .populate("user", "name")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit),
        Review.countDocuments({ product: productId }),
    ]);

    res.status(200).json({
        data: reviews.map((r) => ({
            _id: r._id,
            rating: r.rating,
            comment: r.comment,
            createdAt: r.createdAt,
            userName: displayName(r.user?.name),
        })),
        page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
    });
}

// Cho giao diện biết: mình đã đánh giá chưa, có được đánh giá không
export async function getMyReviewStatus(req, res) {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }
    const [review, purchased] = await Promise.all([
        Review.findOne({ user: req.user._id, product: productId }),
        hasPurchased(req.user._id, productId),
    ]);
    res.status(200).json({ data: { review, purchased: Boolean(purchased) } });
}

export async function createReview(req, res) {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }
    const parsed = createReviewSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    if (!(await hasPurchased(req.user._id, productId))) {
        return res.status(403).json({
            message: "Bạn chỉ có thể đánh giá sản phẩm đã mua và nhận hàng",
        });
    }

    let review;
    try {
        review = await Review.create({
            user: req.user._id,
            product: productId,
            ...parsed.data,
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ message: "Bạn đã đánh giá sản phẩm này rồi" });
        }
        throw err;
    }

    await refreshRating(productId);
    res.status(201).json({ data: review });
}

export async function updateReview(req, res) {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "ID đánh giá không hợp lệ" });
    }
    const parsed = updateReviewSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    // Chỉ tìm trong đánh giá của chính mình
    const review = await Review.findOne({ _id: id, user: req.user._id });
    if (!review) {
        return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    }

    if (parsed.data.rating !== undefined) review.rating = parsed.data.rating;
    if (parsed.data.comment !== undefined) review.comment = parsed.data.comment;
    await review.save();

    await refreshRating(review.product);
    res.status(200).json({ data: review });
}

export async function deleteReview(req, res) {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "ID đánh giá không hợp lệ" });
    }

    const review = await Review.findById(id);
    const isOwner = review && review.user.equals(req.user._id);
    if (!review || (!isOwner && req.user.role !== "admin")) {
        return res.status(404).json({ message: "Không tìm thấy đánh giá" });
    }

    await review.deleteOne();
    await refreshRating(review.product);
    res.status(200).json({ message: "Đã xóa đánh giá" });
}