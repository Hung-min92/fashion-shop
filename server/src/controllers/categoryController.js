import mongoose from "mongoose";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import {
    createCategorySchema,
    updateCategorySchema,
} from "../validators/categoryValidator.js";

export async function listCategories(req, res) {
    const data = await Category.find().sort({ name: 1 });
    res.status(200).json({ data });
}

export async function createCategory(req, res) {
    const parsed = createCategorySchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
    }
    const category = await Category.create(parsed.data);
    res.status(201).json({ data: category });
}

export async function updateCategory(req, res) {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "ID danh mục không hợp lệ" });
    }

    const parsed = updateCategorySchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const category = await Category.findByIdAndUpdate(id, parsed.data, {
        returnDocument: "after",
        runValidators: true,
    });
    if (!category) {
        return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
    res.status(200).json({ data: category });
}

export async function deleteCategory(req, res) {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({ message: "ID danh mục không hợp lệ" });
    }

    const inUse = await Product.exists({ category: id });
    if (inUse) {
        return res
            .status(409)
            .json({ message: "Không thể xóa: vẫn còn sản phẩm thuộc danh mục này" });
    }

    const category = await Category.findByIdAndDelete(id);
    if (!category) {
        return res.status(404).json({ message: "Không tìm thấy danh mục" });
    }
    res.status(200).json({ message: "Đã xóa danh mục" });
}