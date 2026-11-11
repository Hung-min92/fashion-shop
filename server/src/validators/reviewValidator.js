import { z } from "zod";

export const createReviewSchema = z.object({
    rating: z.coerce
        .number()
        .int("Số sao phải là số nguyên")
        .min(1, "Tối thiểu 1 sao")
        .max(5, "Tối đa 5 sao"),
    comment: z.string().trim().max(1000, "Bình luận tối đa 1000 ký tự").optional(),
});

export const updateReviewSchema = createReviewSchema
    .partial()
    .refine((d) => Object.keys(d).length > 0, "Không có gì để cập nhật");

export const listReviewsSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(10),
});