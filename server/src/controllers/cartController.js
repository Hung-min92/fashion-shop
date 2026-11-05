import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { addItemSchema, updateItemSchema } from "../validators/cartValidator.js";

// Lấy giỏ của user, tạo mới nếu chưa có
async function getOrCreateCart(userId) {
    let cart = await Cart.findOne({ user: userId });
    if (!cart) cart = await Cart.create({ user: userId, items: [] });
    return cart;
}

// Biến giỏ thành dữ liệu hiển thị, giá tra từ sản phẩm hiện tại
async function buildCartView(cart) {
    const products = await Product.find({
        _id: { $in: cart.items.map((i) => i.product) },
    });
    const byId = new Map(products.map((p) => [p._id.toString(), p]));

    let total = 0;
    const items = cart.items.map((item) => {
        const product = byId.get(item.product.toString());
        const variant = product?.variants.find((v) => v.sku === item.sku);
        const available = !!product && product.isActive && !!variant;
        const lineTotal = available ? product.price * item.quantity : 0;
        total += lineTotal;

        return {
            itemId: item._id,
            productId: item.product,
            sku: item.sku,
            quantity: item.quantity,
            name: product?.name ?? null,
            size: variant?.size ?? null,
            color: variant?.color ?? null,
            price: available ? product.price : null,
            stock: variant?.stock ?? 0,
            available,
            lineTotal,
        };
    });

    return { items, totalPrice: total };
}

export async function getCart(req, res) {
    const cart = await getOrCreateCart(req.user._id);
    res.status(200).json({ data: await buildCartView(cart) });
}

export async function addItem(req, res) {
    const parsed = addItemSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
    }
    const { productId, sku, quantity } = parsed.data;

    if (!mongoose.isValidObjectId(productId)) {
        return res.status(400).json({ message: "ID sản phẩm không hợp lệ" });
    }

    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
        return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    }

    const variant = product.variants.find((v) => v.sku === sku.toUpperCase());
    if (!variant) {
        return res.status(400).json({ message: "Biến thể không tồn tại" });
    }

    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find(
        (i) => i.product.toString() === productId && i.sku === variant.sku
    );

    const newQuantity = (existing ? existing.quantity : 0) + quantity;
    if (newQuantity > variant.stock) {
        return res.status(400).json({
            message: `Không đủ hàng. Tồn kho: ${variant.stock}, trong giỏ đã có: ${existing ? existing.quantity : 0}`,
        });
    }

    if (existing) {
        existing.quantity = newQuantity;
    } else {
        cart.items.push({ product: productId, sku: variant.sku, quantity });
    }
    await cart.save();

    res.status(200).json({ data: await buildCartView(cart) });
}

export async function updateItem(req, res) {
    const { itemId } = req.params;
    if (!mongoose.isValidObjectId(itemId)) {
        return res.status(400).json({ message: "ID món không hợp lệ" });
    }

    const parsed = updateItemSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.id(itemId);
    if (!item) {
        return res.status(404).json({ message: "Không tìm thấy món trong giỏ" });
    }

    const product = await Product.findOne({ _id: item.product, isActive: true });
    const variant = product?.variants.find((v) => v.sku === item.sku);
    if (!variant) {
        return res.status(400).json({ message: "Sản phẩm không còn khả dụng" });
    }
    if (parsed.data.quantity > variant.stock) {
        return res
            .status(400)
            .json({ message: `Không đủ hàng. Tồn kho: ${variant.stock}` });
    }

    item.quantity = parsed.data.quantity;
    await cart.save();

    res.status(200).json({ data: await buildCartView(cart) });
}

export async function removeItem(req, res) {
    const { itemId } = req.params;
    if (!mongoose.isValidObjectId(itemId)) {
        return res.status(400).json({ message: "ID món không hợp lệ" });
    }

    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.id(itemId);
    if (!item) {
        return res.status(404).json({ message: "Không tìm thấy món trong giỏ" });
    }

    item.deleteOne();
    await cart.save();

    res.status(200).json({ data: await buildCartView(cart) });
}

export async function clearCart(req, res) {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    res.status(200).json({ data: await buildCartView(cart) });
}