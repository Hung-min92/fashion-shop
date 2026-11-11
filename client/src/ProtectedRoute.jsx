import { Navigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";

// role có thể là một chuỗi ("admin") hoặc một mảng (["admin", "viewer"])
export default function ProtectedRoute({ children, role }) {
  const { user, ready } = useAuth();

  if (!ready) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#777777]">Đang tải...</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const allowed = role ? [].concat(role) : null;
  if (allowed && !allowed.includes(user.role)) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#777777]">403 · Truy cập bị từ chối</p>
        <h1 className="mt-2 font-serif text-2xl text-[#171717]">Bạn không có quyền truy cập</h1>
        <p className="mt-2 text-sm text-[#777777]">
          Tài khoản hiện tại không đủ quyền để xem trang này.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block border border-[#171717] px-6 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-[#171717] transition hover:bg-[#171717] hover:text-white"
        >
          Về trang chủ
        </Link>
      </div>
    );
  }

  return children;
}
