import mongoose from "mongoose";
import { z } from "zod";

const objectId = z
    .string()
    .refine((v) => mongoose.isValidObjectId(v), "ID sản phẩm không hợp lệ");
const sku = z
    .string()
    .trim()
    .min(1, "Thiếu SKU")
    .max(50)
    .transform((s) => s.toUpperCase());
const quantity = z
    .number()
    .int("Số lượng không hợp lệ")
    .min(1, "Số lượng tối thiểu là 1")
    .max(99, "Số lượng tối đa là 99");

const lineSchema = z.object({ productId: objectId, sku, quantity });

const phone = z
    .string()
    .trim()
    .regex(/^0\d{9}$/, "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0");

export const previewCartSchema = z.object({
    items: z.array(lineSchema).max(20, "Giỏ hàng tối đa 20 dòng"),
});

export const createGuestOrderSchema = z.object({
    items: z
        .array(lineSchema)
        .min(1, "Giỏ hàng trống")
        .max(20, "Giỏ hàng tối đa 20 dòng"),
    shippingAddress: z.object({
        fullName: z.string().trim().min(1, "Họ tên là bắt buộc").max(100),
        phone,
        street: z.string().trim().min(1, "Địa chỉ giao hàng là bắt buộc").max(200),
        city: z.string().trim().min(1, "Tỉnh / Thành phố là bắt buộc").max(100),
    }),
    note: z.string().trim().max(500, "Ghi chú tối đa 500 ký tự").optional().default(""),
});

export const lookupOrderSchema = z.object({
    code: z
        .string()
        .trim()
        .min(1, "Vui lòng nhập mã đơn")
        .max(30)
        .transform((s) => s.toUpperCase()),
    phone: z.string().trim().min(1, "Vui lòng nhập số điện thoại").max(20),
});