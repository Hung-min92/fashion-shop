import mongoose from "mongoose";
import Product from "../models/Product.js";
import Category from "../models/Category.js";
import { listProductsSchema } from "../validators/productValidator.js";

function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listProducts(req, res) {
    const parsed = listProductsSchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const { search, category, minPrice, maxPrice, page, limit } = parsed.data;

    const filter = { isActive: true };

    if (search) {
        filter.name = { $regex: escapeRegex(search), $options: "i" };
    }

    if (category) {
        if (!mongoose.isValidObjectId(category)) {
            return res.status(400).json({ message: "Danh mục không hợp lệ" });
        }
        filter.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
        filter.price = {};
        if (minPrice !== undefined) filter.price.$gte = minPrice;
        if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    const [data, totalItems] = await Promise.all([
        Product.find(filter)
            .populate("category", "name slug")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit),
        Product.countDocuments(filter),
    ]);

    res.status(200).json({
        data,
        page,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
    });
}

export async function getProduct(req, res) {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }

    const product = await Product.findOne({ _id: id, isActive: true }).populate(
        "category",
        "name slug"
    );

    if (!product) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    res.status(200).json({ data: product });
}