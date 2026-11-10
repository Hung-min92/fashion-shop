import jwt from "jsonwebtoken";
import User from "../models/User.js";

export async function protect(req, res, next) {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Vui lòng đăng nhập" });
    }

    const token = header.split(" ")[1];

    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        return res
            .status(401)
            .json({ message: "Token không hợp lệ hoặc đã hết hạn" });
    }

    const user = await User.findById(payload.id);
    if (!user || !user.isActive) {
        return res.status(401).json({ message: "Tài khoản không khả dụng" });
    }

    req.user = user;
    next();
}

export function requireRole(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: "Bạn không có quyền thực hiện" });
        }
        next();
    };
}
// admin được mọi thao tác; viewer (tài khoản demo) chỉ được đọc
export function requireAdminOrViewerRead(req, res, next) {
    const { role } = req.user;
    if (role === "admin") return next();
    if (role === "viewer" && (req.method === "GET" || req.method === "HEAD")) {
        return next();
    }
    return res.status(403).json({ message: "Bạn không có quyền thực hiện" });
}