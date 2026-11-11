import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

// role có thể là một chuỗi ("admin") hoặc một mảng (["admin", "viewer"])
export default function ProtectedRoute({ children, role }) {
    const { user, ready } = useAuth();

    if (!ready) return <p>Đang tải...</p>;
    if (!user) return <Navigate to="/login" replace />;

    const allowed = role ? [].concat(role) : null;
    if (allowed && !allowed.includes(user.role)) {
        return <p>Bạn không có quyền truy cập.</p>;
    }

    return children;
}