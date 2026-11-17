import crypto from "crypto";
import EmailToken from "../models/EmailToken.js";

const hash = (raw) => crypto.createHash("sha256").update(raw).digest("hex");

export const TOKEN_TTL = {
    verify: 24 * 60 * 60 * 1000, // 24 giờ
    reset: 30 * 60 * 1000, // 30 phút
};
const RESEND_COOLDOWN_MS = 60 * 1000;

// Trả về mã gốc (gửi qua email). Database chỉ lưu bản băm.
export async function createToken(userId, type) {
    await EmailToken.deleteMany({ user: userId, type }); // mã cũ mất hiệu lực
    const raw = crypto.randomBytes(32).toString("hex"); // 64 ký tự hex
    await EmailToken.create({
        user: userId,
        type,
        tokenHash: hash(raw),
        expiresAt: new Date(Date.now() + TOKEN_TTL[type]),
    });
    return raw;
}

// Kiểm tra và xóa trong một bước nguyên tử: mã chỉ dùng được một lần
export async function consumeToken(raw, type) {
    if (typeof raw !== "string" || raw.length !== 64) return null;
    return EmailToken.findOneAndDelete({
        tokenHash: hash(raw),
        type,
        expiresAt: { $gt: new Date() },
    });
}

// Chống bấm "gửi lại" liên tục để spam hộp thư người khác
export async function isOnCooldown(userId, type) {
    const recent = await EmailToken.exists({
        user: userId,
        type,
        createdAt: { $gt: new Date(Date.now() - RESEND_COOLDOWN_MS) },
    });
    return Boolean(recent);
}