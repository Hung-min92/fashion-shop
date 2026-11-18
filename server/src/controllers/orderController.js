import mongoose from "mongoose";
import Cart from "../models/Cart.js";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import {
  createOrderSchema,
  updateStatusSchema,
  listAdminOrdersSchema,
} from "../validators/orderValidator.js";
import {
  createGuestOrderSchema,
  lookupOrderSchema,
} from "../validators/guestValidator.js";
import { generateOrderCode } from "../utils/orderCode.js";
import User from "../models/User.js"; // cần để populate("user") hoạt động

// Hoàn lại tồn kho cho các món đã trừ
async function restoreStock(deducted) {
  for (const d of deducted) {
    await Product.updateOne(
      { _id: d.product, "variants.sku": d.sku },
      { $inc: { "variants.$.stock": d.quantity } }
    );
  }
}

// Lõi đặt hàng dùng chung cho thành viên và khách vãng lai.
// lines: [{ product, sku, quantity }]. Trả { order } hoặc { error: { status, message } }
async function placeOrder({ userId, isGuest, lines, shippingAddress, note }) {
  // 1. Tra giá và thông tin từ database, không tin client
  const products = await Product.find({
    _id: { $in: lines.map((l) => l.product) },
  });
  const byId = new Map(products.map((p) => [p._id.toString(), p]));

  const orderItems = [];
  for (const line of lines) {
    const product = byId.get(line.product.toString());
    const variant = product?.variants.find((v) => v.sku === line.sku);
    if (!product || !product.isActive || !variant) {
      return {
        error: { status: 400, message: `Sản phẩm không còn bán (SKU ${line.sku})` },
      };
    }
    orderItems.push({
      product: product._id,
      sku: variant.sku,
      name: product.name,
      size: variant.size,
      color: variant.color,
      price: product.price,
      quantity: line.quantity,
    });
  }

  // 2. Trừ kho nguyên tử từng món, lỗi thì hoàn lại
  const deducted = [];
  for (const oi of orderItems) {
    const result = await Product.updateOne(
      {
        _id: oi.product,
        isActive: true,
        variants: { $elemMatch: { sku: oi.sku, stock: { $gte: oi.quantity } } },
      },
      { $inc: { "variants.$.stock": -oi.quantity } }
    );
    if (result.modifiedCount !== 1) {
      await restoreStock(deducted);
      return {
        error: {
          status: 400,
          message: `Không đủ hàng cho "${oi.name}" (${oi.size}, ${oi.color})`,
        },
      };
    }
    deducted.push({ product: oi.product, sku: oi.sku, quantity: oi.quantity });
  }

  // 3. Tạo đơn, backend tự tính tổng. Thử lại nếu trùng mã đơn (cực hiếm)
  const totalPrice = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  let order = null;
  for (let attempt = 0; attempt < 5 && !order; attempt++) {
    try {
      order = await Order.create({
        user: userId ?? undefined,
        isGuest,
        orderCode: generateOrderCode(),
        items: orderItems,
        shippingAddress,
        note,
        totalPrice,
      });
    } catch (error) {
      const duplicateCode = error?.code === 11000 && error?.keyPattern?.orderCode;
      if (!duplicateCode) {
        await restoreStock(deducted);
        throw error;
      }
    }
  }
  if (!order) {
    await restoreStock(deducted);
    throw new Error("Không tạo được mã đơn hàng");
  }
  return { order };
}

export async function createOrder(req, res) {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ message: "Giỏ hàng trống" });
  }

  const result = await placeOrder({
    userId: req.user._id,
    isGuest: false,
    lines: cart.items.map((i) => ({
      product: i.product,
      sku: i.sku,
      quantity: i.quantity,
    })),
    shippingAddress: parsed.data.shippingAddress,
    note: parsed.data.note,
  });
  if (result.error) {
    return res.status(result.error.status).json({ message: result.error.message });
  }

  // Làm trống giỏ
  cart.items = [];
  await cart.save();

  res.status(201).json({ data: result.order });
}

// Gộp các dòng trùng (cùng sản phẩm + SKU) để không trừ kho hai lần cho một món
function mergeLines(items) {
  const map = new Map();
  for (const it of items) {
    const key = `${it.productId}:${it.sku}`;
    const found = map.get(key);
    if (found) found.quantity += it.quantity;
    else map.set(key, { product: it.productId, sku: it.sku, quantity: it.quantity });
  }
  return [...map.values()];
}

export async function createGuestOrder(req, res) {
  const parsed = createGuestOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const result = await placeOrder({
    userId: null,
    isGuest: true,
    lines: mergeLines(parsed.data.items),
    shippingAddress: parsed.data.shippingAddress,
    note: parsed.data.note,
  });
  if (result.error) {
    return res.status(result.error.status).json({ message: result.error.message });
  }
  res.status(201).json({ data: result.order });
}

// Tra cứu đơn khách vãng lai bằng mã đơn + số điện thoại
const digits = (s) => String(s ?? "").replace(/\D/g, "");
const NOT_FOUND_MESSAGE =
  "Không tìm thấy đơn hàng. Hãy kiểm tra lại mã đơn và số điện thoại.";

async function findGuestOrder(code, phone) {
  const order = await Order.findOne({ orderCode: code, isGuest: true });
  if (!order) return null;
  if (digits(order.shippingAddress.phone) !== digits(phone)) return null;
  return order;
}

export async function lookupOrder(req, res) {
  const parsed = lookupOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }
  const order = await findGuestOrder(parsed.data.code, parsed.data.phone);
  if (!order) return res.status(404).json({ message: NOT_FOUND_MESSAGE });
  res.status(200).json({ data: order });
}

export async function listMyOrders(req, res) {
  const data = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ data });
}

export async function getOrder(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "ID đơn hàng không hợp lệ" });
  }

  const order = await Order.findById(id);
  if (!order) {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }

  // Đơn khách vãng lai không có user nên phải kiểm tra tồn tại trước
  const isOwner = Boolean(order.user) && order.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }

  res.status(200).json({ data: order });
}

// Trạng thái hiện tại -> các trạng thái được phép chuyển tới
const ALLOWED_TRANSITIONS = {
  pending: ["shipping", "cancelled"],
  shipping: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

// Đổi trạng thái nguyên tử; nếu hủy thì hoàn kho. Trả về đơn mới hoặc null
async function changeStatus(order, newStatus) {
  const update = { status: newStatus };
  if (newStatus === "completed") update.paymentStatus = "paid";

  const updated = await Order.findOneAndUpdate(
    { _id: order._id, status: order.status },
    update,
    { returnDocument: "after" }
  );
  if (!updated) return null;

  if (newStatus === "cancelled") {
    await restoreStock(
      updated.items.map((i) => ({
        product: i.product,
        sku: i.sku,
        quantity: i.quantity,
      }))
    );
  }
  return updated;
}

export async function cancelMyOrder(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "ID đơn hàng không hợp lệ" });
  }

  const order = await Order.findOne({ _id: id, user: req.user._id });
  if (!order) {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }
  if (order.status !== "pending") {
    return res.status(400).json({ message: "Chỉ hủy được đơn đang chờ xử lý" });
  }

  const updated = await changeStatus(order, "cancelled");
  if (!updated) {
    return res
      .status(409)
      .json({ message: "Đơn hàng vừa thay đổi, vui lòng thử lại" });
  }
  res.status(200).json({ data: updated });
}

export async function cancelGuestOrder(req, res) {
  const parsed = lookupOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }
  const order = await findGuestOrder(parsed.data.code, parsed.data.phone);
  if (!order) return res.status(404).json({ message: NOT_FOUND_MESSAGE });
  if (order.status !== "pending") {
    return res.status(400).json({ message: "Chỉ hủy được đơn đang chờ xử lý" });
  }

  const updated = await changeStatus(order, "cancelled");
  if (!updated) {
    return res
      .status(409)
      .json({ message: "Đơn hàng vừa thay đổi, vui lòng thử lại" });
  }
  res.status(200).json({ data: updated });
}

// ---- Che thông tin cá nhân cho tài khoản demo (viewer) ----

function maskName(name) {
  if (!name) return name;
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => `${word[0]}***`)
    .join(" ");
}

function maskPhone(phone) {
  if (!phone) return phone;
  return phone.slice(0, -3).replace(/\d/g, "*") + phone.slice(-3);
}

function maskEmail(email) {
  if (!email) return email;
  const [local, domain] = email.split("@");
  return `${local[0]}***@${domain}`;
}

function maskOrderForViewer(order) {
  const o = order.toObject();
  if (o.shippingAddress) {
    o.shippingAddress = {
      ...o.shippingAddress,
      fullName: maskName(o.shippingAddress.fullName),
      phone: maskPhone(o.shippingAddress.phone),
      street: "***",
    };
  }
  if (o.user) {
    o.user = { ...o.user, name: maskName(o.user.name), email: maskEmail(o.user.email) };
  }
  o.note = o.note ? "***" : "";
  return o;
}

export async function listAdminOrders(req, res) {
  const parsed = listAdminOrdersSchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }

  const { status, page, limit } = parsed.data;
  const filter = status ? { status } : {};

  const [data, totalItems] = await Promise.all([
    Order.find(filter)
      .populate("user", "name email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Order.countDocuments(filter),
  ]);

  const result =
    req.user.role === "viewer" ? data.map(maskOrderForViewer) : data;

  res.status(200).json({
    data: result,
    page,
    totalPages: Math.ceil(totalItems / limit),
    totalItems,
  });
}

export async function updateOrderStatus(req, res) {
  const { id } = req.params;
  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ message: "ID đơn hàng không hợp lệ" });
  }

  const parsed = updateStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0].message });
  }
  const newStatus = parsed.data.status;

  const order = await Order.findById(id);
  if (!order) {
    return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
  }

  if (!ALLOWED_TRANSITIONS[order.status].includes(newStatus)) {
    return res.status(400).json({
      message: `Không thể chuyển từ "${order.status}" sang "${newStatus}"`,
    });
  }

  const updated = await changeStatus(order, newStatus);
  if (!updated) {
    return res
      .status(409)
      .json({ message: "Đơn hàng vừa thay đổi, vui lòng thử lại" });
  }
  res.status(200).json({ data: updated });
}