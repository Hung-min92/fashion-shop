import { z } from "zod";

export const createOrderSchema = z.object({
    shippingAddress: z.object({
        fullName: z.string().trim().min(1, "Họ tên là bắt buộc"),
        phone: z
            .string()
            .trim()
            .regex(/^0\d{9}$/, "Số điện thoại không hợp lệ"),
        street: z.string().trim().min(1, "Địa chỉ là bắt buộc"),
        city: z.string().trim().min(1, "Tỉnh/thành là bắt buộc"),
    }),
    note: z.string().trim().max(500).optional(),
});