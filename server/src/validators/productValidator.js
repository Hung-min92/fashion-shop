import { z } from "zod";

export const listProductsSchema = z.object({
    search: z.string().trim().optional(),
    category: z.string().trim().optional(),
    minPrice: z.coerce.number().min(0).optional(),
    maxPrice: z.coerce.number().min(0).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
});
const variantInput = z.object({
    sku: z.string().trim().min(1, "SKU là bắt buộc"),
    size: z.string().trim().min(1, "Size là bắt buộc"),
    color: z.string().trim().min(1, "Màu là bắt buộc"),
    stock: z.coerce.number().int().min(0, "Tồn kho không được âm"),
});

export const createProductSchema = z.object({
    name: z.string().trim().min(1, "Tên sản phẩm là bắt buộc").max(150),
    description: z.string().trim().optional(),
    price: z.coerce.number().min(0, "Giá không được âm"),
    images: z.array(z.string().trim()).optional(),
    category: z.string().trim().min(1, "Danh mục là bắt buộc"),
    variants: z.array(variantInput).min(1, "Cần ít nhất một biến thể"),
});

export const updateProductSchema = createProductSchema.partial();