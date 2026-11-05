import { z } from "zod";

export const addItemSchema = z.object({
    productId: z.string().trim().min(1, "productId là bắt buộc"),
    sku: z.string().trim().min(1, "SKU là bắt buộc"),
    quantity: z.coerce.number().int().min(1, "Số lượng tối thiểu là 1").max(99),
});

export const updateItemSchema = z.object({
    quantity: z.coerce.number().int().min(1, "Số lượng tối thiểu là 1").max(99),
});