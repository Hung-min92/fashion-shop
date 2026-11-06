import { Routes, Route, Link, useNavigate } from "react-router-dom";
import ProductListPage from "./pages/ProductListPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import { useAuth } from "./AuthContext.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage.jsx";
import AdminProductsPage from "./pages/admin/AdminProductsPage.jsx";

export default function App() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-xl font-bold">
            Fashion Shop
          </Link>

          <nav className="flex items-center gap-4 text-sm">
            <Link to="/" className="hover:underline">Trang chủ</Link>
            {user ? (
              <>
                <span>Xin chào, {user.name}</span>
                <Link to="/cart" className="hover:underline">Giỏ hàng</Link>
                <Link to="/orders" className="hover:underline">Đơn hàng</Link>
                {user.role === "admin" && (
                  <>
                    <Link to="/admin/orders" className="hover:underline">Quản lý đơn</Link>
                    <Link to="/admin/products" className="hover:underline">Quản lý sản phẩm</Link>
                  </>
                )}
                <button onClick={handleLogout} className="rounded border px-3 py-1">
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:underline">Đăng nhập</Link>
                <Link to="/register" className="rounded bg-black px-3 py-1 text-white">
                  Đăng ký
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Routes>
          <Route path="/" element={<ProductListPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute role="admin"><AdminOrdersPage /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute role="admin"><AdminProductsPage /></ProtectedRoute>} />
          <Route path="*" element={<p>Không tìm thấy trang.</p>} />
        </Routes>
      </main>
    </div>
  );
}