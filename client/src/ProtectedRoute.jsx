import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

export default function ProtectedRoute({ children, role }) {
    const { user, ready } = useAuth();

    if (!ready) return <p>Đang tải...</p>;
    if (!user) return <Navigate to="/login" replace />;
    if (role && user.role !== role) return <p>Bạn không có quyền truy cập.</p>;

    return children;
}