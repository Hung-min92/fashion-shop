import mongoose from "mongoose";
import Category from "../models/Category.js"; // cần để populate lồng category hoạt động
import Product from "../models/Product.js";
import Wishlist from "../models/Wishlist.js";

const MAX_ITEMS = 100;

export async function getWishlist(req, res) {
    const wishlist = await Wishlist.findOne({ user: req.user._id }).populate({
        path: "products",
        match: { isActive: true },
        populate: { path: "category", select: "name slug" },
    });

    // Mới thêm hiện trước; bỏ phần tử rỗng (sản phẩm đã bị ẩn)
    const data = wishlist ? wishlist.products.filter(Boolean).reverse() : [];
    res.status(200).json({ data });
}

export async function addToWishlist(req, res) {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }

    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const existing = await Wishlist.findOne({ user: req.user._id }).select("products");
    const alreadyIn = existing?.products.some((id) => id.equals(productId));
    if (!alreadyIn && existing && existing.products.length >= MAX_ITEMS) {
        return res
            .status(400)
            .json({ message: `Danh sách yêu thích tối đa ${MAX_ITEMS} sản phẩm` });
    }

    await Wishlist.updateOne(
        { user: req.user._id },
        { $addToSet: { products: productId } },
        { upsert: true }
    );

    res.status(200).json({ data: { productId } });
}

export async function removeFromWishlist(req, res) {
    const { productId } = req.params;
    if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }

    await Wishlist.updateOne(
        { user: req.user._id },
        { $pull: { products: productId } }
    );

    res.status(200).json({ data: { productId } });
}