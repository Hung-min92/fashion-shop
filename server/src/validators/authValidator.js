import { z } from "zod";

export const registerSchema = z.object({
    name: z.string().trim().min(1, "Tên là bắt buộc").max(100),
    email: z.string().trim().email("Email không hợp lệ"),
    password: z.string().min(8, "Mật khẩu tối thiểu 8 ký tự").max(72),
    phone: z.string().trim().optional(),
});
export const loginSchema = z.object({
    email: z.string().trim().email("Email không hợp lệ"),
    password: z.string().min(1, "Mật khẩu là bắt buộc"),
});