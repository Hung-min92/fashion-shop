
import { z } from "zod";

export const createCategorySchema = z.object({
    name: z.string().trim().min(1, "Tên danh mục là bắt buộc").max(100),
    slug: z
        .string()
        .trim()
        .toLowerCase()
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường, số và dấu gạch ngang"),
});

export const updateCategorySchema = createCategorySchema.partial();