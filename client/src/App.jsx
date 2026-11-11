import { Routes, Route, Link } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import ProductListPage from "./pages/ProductListPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import AdminOrdersPage from "./pages/admin/AdminOrdersPage.jsx";
import AdminProductsPage from "./pages/admin/AdminProductsPage.jsx";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage.jsx";
import WishlistPage from "./pages/WishlistPage.jsx";
import { WishlistProvider } from "./WishlistContext.jsx";
import { CartProvider } from "./CartContext.jsx";
import { ToastProvider } from "./ToastContext.jsx";
import AnnouncementBar from "./components/layout/AnnouncementBar.jsx";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";

function PageContainer({ children }) {
  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
      {children}
    </div>
  );
}

function NotFoundPage() {
  return (
    <PageContainer>
      <div className="mx-auto max-w-md py-16 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-[#777777]">404</p>
        <h1 className="mt-2 font-serif text-3xl text-[#171717]">Không tìm thấy trang</h1>
        <p className="mt-3 text-sm text-[#777777]">
          Đường dẫn bạn truy cập không tồn tại hoặc đã được thay đổi.
        </p>
        <Link
          to="/"
          className="mt-8 inline-block bg-[#171717] px-7 py-3 text-xs font-medium uppercase tracking-[0.16em] text-white transition hover:bg-[#202020]"
        >
          Quay lại trang chủ
        </Link>
      </div>
    </PageContainer>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <CartProvider>
        <WishlistProvider>
          <div className="flex min-h-screen flex-col bg-white text-[#202020]">
            <AnnouncementBar />
            <Header />

            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/products"
                  element={
                    <PageContainer>
                      <ProductListPage />
                    </PageContainer>
                  }
                />
                <Route
                  path="/categories/:slug"
                  element={
                    <PageContainer>
                      <ProductListPage />
                    </PageContainer>
                  }
                />
                <Route
                  path="/products/:id"
                  element={
                    <PageContainer>
                      <ProductDetailPage />
                    </PageContainer>
                  }
                />
                <Route
                  path="/login"
                  element={
                    <PageContainer>
                      <AuthPage mode="login" />
                    </PageContainer>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PageContainer>
                      <AuthPage mode="register" />
                    </PageContainer>
                  }
                />
                <Route
                  path="/cart"
                  element={
                    <PageContainer>
                      <ProtectedRoute>
                        <CartPage />
                      </ProtectedRoute>
                    </PageContainer>
                  }
                />
                <Route
                  path="/checkout"
                  element={
                    <PageContainer>
                      <ProtectedRoute>
                        <CheckoutPage />
                      </ProtectedRoute>
                    </PageContainer>
                  }
                />
                <Route
                  path="/orders"
                  element={
                    <PageContainer>
                      <ProtectedRoute>
                        <OrdersPage />
                      </ProtectedRoute>
                    </PageContainer>
                  }
                />
                <Route
                  path="/wishlist"
                  element={
                    <PageContainer>
                      <ProtectedRoute role="customer">
                        <WishlistPage />
                      </ProtectedRoute>
                    </PageContainer>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <PageContainer>
                      <ProtectedRoute role={["admin", "viewer"]}>
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    </PageContainer>
                  }
                />
                <Route
                  path="/admin/orders"
                  element={
                    <PageContainer>
                      <ProtectedRoute role={["admin", "viewer"]}>
                        <AdminOrdersPage />
                      </ProtectedRoute>
                    </PageContainer>
                  }
                />
                <Route
                  path="/admin/products"
                  element={
                    <PageContainer>
                      <ProtectedRoute role={["admin", "viewer"]}>
                        <AdminProductsPage />
                      </ProtectedRoute>
                    </PageContainer>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </WishlistProvider>
      </CartProvider>
    </ToastProvider>
  );
}
