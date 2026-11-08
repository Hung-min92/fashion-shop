import { z } from "zod";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import User from "../models/User.js";

const TZ = "Asia/Ho_Chi_Minh";
const REVENUE_STATUSES = ["completed"];
const LOW_STOCK_THRESHOLD = 5;
const DAY_MS = 24 * 60 * 60 * 1000;
const STATUSES = ["pending", "shipping", "completed", "cancelled"];

const querySchema = z.object({
    days: z.enum(["7", "30", "90"]).default("30"),
});

// "2026-11-08" theo giờ Việt Nam
function dayKey(date) {
    return new Intl.DateTimeFormat("en-CA", { timeZone: TZ }).format(date);
}

export async function getStats(req, res) {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
        return res.status(400).json({ message: "days chỉ nhận 7, 30 hoặc 90" });
    }
    const days = Number(parsed.data.days);

    const keys = [];
    for (let i = days - 1; i >= 0; i--) {
        keys.push(dayKey(new Date(Date.now() - i * DAY_MS)));
    }
    const from = new Date(`${keys[0]}T00:00:00+07:00`);

    const [statusRows, dayRows, topProducts, lowStock, totalCustomers, totalProducts] =
        await Promise.all([
            Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),

            Order.aggregate([
                { $match: { status: { $in: REVENUE_STATUSES }, createdAt: { $gte: from } } },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: TZ },
                        },
                        revenue: { $sum: "$totalPrice" },
                        orders: { $sum: 1 },
                    },
                },
            ]),

            Order.aggregate([
                { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: from } } },
                { $unwind: "$items" },
                {
                    $group: {
                        _id: "$items.product",
                        name: { $first: "$items.name" },
                        quantity: { $sum: "$items.quantity" },
                        revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
                    },
                },
                { $sort: { quantity: -1 } },
                { $limit: 5 },
            ]),

            Product.aggregate([
                { $match: { isActive: true } },
                { $unwind: "$variants" },
                { $match: { "variants.stock": { $lte: LOW_STOCK_THRESHOLD } } },
                {
                    $project: {
                        _id: 0,
                        productId: "$_id",
                        name: 1,
                        sku: "$variants.sku",
                        size: "$variants.size",
                        color: "$variants.color",
                        stock: "$variants.stock",
                    },
                },
                { $sort: { stock: 1 } },
                { $limit: 10 },
            ]),

            User.countDocuments({ role: { $ne: "admin" } }),
            Product.countDocuments({ isActive: true }),
        ]);

    const statusCounts = Object.fromEntries(STATUSES.map((s) => [s, 0]));
    for (const row of statusRows) statusCounts[row._id] = row.count;

    const byDay = new Map(dayRows.map((r) => [r._id, r]));
    const revenueByDay = keys.map((date) => ({
        date,
        revenue: byDay.get(date)?.revenue ?? 0,
        orders: byDay.get(date)?.orders ?? 0,
    }));

    const revenue = revenueByDay.reduce((sum, d) => sum + d.revenue, 0);
    const completedOrders = revenueByDay.reduce((sum, d) => sum + d.orders, 0);

    res.status(200).json({
        data: {
            days,
            summary: {
                revenue,
                completedOrders,
                avgOrderValue: completedOrders ? Math.round(revenue / completedOrders) : 0,
                totalCustomers,
                totalProducts,
                statusCounts,
            },
            revenueByDay,
            topProducts: topProducts.map((p) => ({
                productId: p._id,
                name: p.name,
                quantity: p.quantity,
                revenue: p.revenue,
            })),
            lowStock,
        },
    });
}