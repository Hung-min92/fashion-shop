import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { apiGet } from "../../api.js";
import { useAuth } from "../../AuthContext.jsx";
import { useCart } from "../../CartContext.jsx";
import { useWishlist } from "../../WishlistContext.jsx";
import {
  ArrowRightIcon,
  BagIcon,
  ChevronDownIcon,
  CloseIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "../Icons.jsx";

export default function Header() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const { items: wishlistItems, isCustomer } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [categories, setCategories] = useState([]);
  const [activeMega, setActiveMega] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const searchInputRef = useRef(null);
  const accountRef = useRef(null);
  const megaTimerRef = useRef(null);

  useEffect(() => {
    apiGet("/api/categories")
      .then((body) => setCategories(body.data || []))
      .catch(() => { });
  }, []);

  // Close menus on route change
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      setActiveMega(null);
      setSearchOpen(false);
      setAccountOpen(false);
      setMobileOpen(false);
    });
    return () => cancelAnimationFrame(id);
  }, [location.pathname, location.search]);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  // Close account dropdown on outside click & ESC
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setActiveMega(null);
        setAccountOpen(false);
        setMobileOpen(false);
      }
    }
    function onMouseDown(e) {
      if (accountRef.current && !accountRef.current.contains(e.target)) {
        setAccountOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onMouseDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onMouseDown);
    };
  }, []);

  const navItems = useMemo(
    () => [
      { key: "home", label: "Trang chủ", to: "/" },
      { key: "products", label: "Sản phẩm", to: "/products", mega: true },
      { key: "new", label: "Hàng mới về", to: "/products?sort=newest" },
      { key: "collections", label: "Bộ sưu tập", to: "/products", mega: true },
      { key: "deals", label: "Giá tốt", to: "/products?sort=price_asc" },
    ],
    []
  );

  function openMega(key) {
    if (megaTimerRef.current) clearTimeout(megaTimerRef.current);
    setActiveMega(key);
  }

  function scheduleCloseMega() {
    if (megaTimerRef.current) clearTimeout(megaTimerRef.current);
    megaTimerRef.current = setTimeout(() => setActiveMega(null), 120);
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    const q = searchQuery.trim();
    setSearchOpen(false);
    if (q) {
      navigate(`/products?search=${encodeURIComponent(q)}`);
    } else {
      navigate("/products");
    }
  }

  function handleLogout() {
    logout();
    setAccountOpen(false);
    setMobileOpen(false);
    navigate("/");
  }

  const showShopUtilities = !user || user.role !== "viewer";
  const isStaff = user?.role === "admin" || user?.role === "viewer";

  return (
    <header
      className="sticky top-0 z-40 border-b border-[#EAEAEA] bg-white/95 backdrop-blur-md"
      onMouseLeave={scheduleCloseMega}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
        {/* Left: Mobile Menu Trigger + Brand Logo */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Mở menu"
            className="-ml-1 p-1.5 text-[#171717] transition hover:opacity-60 lg:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </button>

          <Link
            to="/"
            className="text-base font-semibold uppercase tracking-[0.24em] text-[#171717] transition hover:opacity-75 sm:text-lg"
          >
            GIN SHOP
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Điều hướng chính">
          {navItems.map((item) => {
            const isActive =
              item.to === "/"
                ? location.pathname === "/"
                : location.pathname + location.search === item.to;

            return (
              <div
                key={item.key}
                onMouseEnter={() => (item.mega ? openMega(item.key) : setActiveMega(null))}
                className="relative py-5"
              >
                <Link
                  to={item.to}
                  className={`relative text-[12px] font-medium uppercase tracking-[0.14em] transition-colors hover:text-[#171717] ${isActive ? "text-[#171717]" : "text-[#777777]"
                    }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-[1px] bg-[#171717] transition-all duration-300 ${isActive || activeMega === item.key ? "w-full" : "w-0"
                      }`}
                  />
                </Link>
              </div>
            );
          })}
        </nav>

        {/* Right: Search, Account, Wishlist, Shopping Bag */}
        <div className="flex items-center gap-3 sm:gap-5">
          {/* Search Toggle */}
          <button
            type="button"
            onClick={() => {
              setSearchOpen((v) => !v);
              setAccountOpen(false);
              setActiveMega(null);
            }}
            aria-label="Tìm kiếm"
            className="p-1 text-[#171717] transition hover:opacity-60"
          >
            <SearchIcon className="h-[19px] w-[19px]" />
          </button>

          {/* Account Menu */}
          <div className="relative" ref={accountRef}>
            {user ? (
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                aria-label="Tài khoản"
                className="flex items-center gap-1.5 p-1 text-[#171717] transition hover:opacity-60"
              >
                <UserIcon className="h-[19px] w-[19px]" />
                <span className="hidden max-w-[90px] truncate text-[12px] font-medium tracking-wide xl:inline">
                  {user.name}
                </span>
                <ChevronDownIcon className="hidden h-3 w-3 xl:inline" />
              </button>
            ) : (
              <Link
                to="/login"
                aria-label="Đăng nhập"
                className="flex items-center gap-1.5 p-1 text-[#171717] transition hover:opacity-60"
              >
                <UserIcon className="h-[19px] w-[19px]" />
              </Link>
            )}

            {user && accountOpen && (
              <div className="animate-slide-down absolute right-0 mt-2 w-60 border border-[#EAEAEA] bg-white py-2 shadow-lg">
                <div className="border-b border-[#EAEAEA] px-4 py-2.5">
                  <p className="truncate text-xs font-medium text-[#171717]">{user.name}</p>
                  <p className="truncate text-[11px] text-[#777777]">{user.email}</p>
                  {isStaff && (
                    <span className="mt-1 inline-block bg-[#F5F4F0] px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-[#171717]">
                      {user.role === "viewer" ? "Demo Viewer" : "Quản trị viên"}
                    </span>
                  )}
                </div>

                <div className="py-1 text-xs">
                  {showShopUtilities && (
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-[#202020] transition hover:bg-[#F5F4F0]"
                    >
                      Đơn hàng của tôi
                    </Link>
                  )}
                  {isCustomer && (
                    <Link
                      to="/wishlist"
                      className="block px-4 py-2 text-[#202020] transition hover:bg-[#F5F4F0]"
                    >
                      Danh sách yêu thích ({wishlistItems.length})
                    </Link>
                  )}
                  {isStaff && (
                    <>
                      <div className="my-1 border-t border-[#EAEAEA]" />
                      <p className="px-4 py-1 text-[10px] uppercase tracking-[0.14em] text-[#777777]">
                        Quản trị
                      </p>
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-[#202020] transition hover:bg-[#F5F4F0]"
                      >
                        Thống kê tổng quan
                      </Link>
                      <Link
                        to="/admin/orders"
                        className="block px-4 py-2 text-[#202020] transition hover:bg-[#F5F4F0]"
                      >
                        Quản lý đơn hàng
                      </Link>
                      <Link
                        to="/admin/products"
                        className="block px-4 py-2 text-[#202020] transition hover:bg-[#F5F4F0]"
                      >
                        Quản lý sản phẩm
                      </Link>
                    </>
                  )}
                </div>

                <div className="border-t border-[#EAEAEA] pt-1">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block w-full px-4 py-2 text-left text-xs text-[#777777] transition hover:bg-[#F5F4F0] hover:text-[#171717]"
                  >
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Wishlist */}
          {(!user || isCustomer) && (
            <Link
              to={user ? "/wishlist" : "/login"}
              aria-label="Danh sách yêu thích"
              className="relative p-1 text-[#171717] transition hover:opacity-60"
            >
              <HeartIcon className="h-[19px] w-[19px]" />
              {isCustomer && wishlistItems.length > 0 && (
                <span className="absolute -right-1 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#B9A58A] px-1 text-[10px] font-medium text-white">
                  {wishlistItems.length}
                </span>
              )}
            </Link>
          )}

          {/* Shopping Bag */}
          {showShopUtilities && (
            <Link
              to="/cart"
              aria-label="Giỏ hàng"
              className="relative p-1 text-[#171717] transition hover:opacity-60"
            >
              <BagIcon className="h-[19px] w-[19px]" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#171717] px-1 text-[10px] font-medium text-white">
                  {itemCount}
                </span>
              )}
            </Link>
          )}
        </div>
      </div>

      {/* Desktop Mega Menu */}
      {activeMega && (
        <div
          onMouseEnter={() => openMega(activeMega)}
          onMouseLeave={scheduleCloseMega}
          className="animate-slide-down absolute left-0 right-0 top-full hidden border-b border-[#EAEAEA] bg-white shadow-sm lg:block"
        >
          <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-8 px-10 py-8">
            <div className="col-span-3 border-r border-[#EAEAEA] pr-6">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#777777]">
                Nổi bật
              </p>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link to="/products" className="transition hover:text-[#B9A58A]">
                    Tất cả sản phẩm
                  </Link>
                </li>
                <li>
                  <Link to="/products?sort=newest" className="transition hover:text-[#B9A58A]">
                    Hàng mới về — Season 2026
                  </Link>
                </li>
                <li>
                  <Link to="/products?sort=price_asc" className="transition hover:text-[#B9A58A]">
                    Giá tốt nhất
                  </Link>
                </li>
                <li>
                  <Link to="/products?sort=price_desc" className="transition hover:text-[#B9A58A]">
                    Thiết kế cao cấp
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-5">
              <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#777777]">
                Danh mục sản phẩm
              </p>
              {categories.length === 0 ? (
                <p className="text-xs text-[#777777]">Đang tải danh mục...</p>
              ) : (
                <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
                  {categories.map((c) => (
                    <Link
                      key={c._id}
                      to={`/products?category=${c._id}`}
                      className="flex items-center justify-between border-b border-transparent py-1 text-[#202020] transition hover:border-[#EAEAEA] hover:text-[#171717]"
                    >
                      <span>{c.name}</span>
                      <ArrowRightIcon className="h-3.5 w-3.5 opacity-40" />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="col-span-4">
              <Link
                to="/products?sort=newest"
                className="group flex h-full flex-col justify-between bg-[#F5F4F0] p-6 transition hover:bg-[#efede7]"
              >
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-[#777777]">
                    Editorial Edit
                  </p>
                  <p className="mt-2 font-serif text-xl text-[#171717]">
                    Timeless Style. Everyday Elegance.
                  </p>
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-[#171717]">
                  Khám phá ngay
                  <ArrowRightIcon className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Search Overlay Bar */}
      {searchOpen && (
        <div className="animate-slide-down absolute left-0 right-0 top-full border-b border-[#EAEAEA] bg-white shadow-sm">
          <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-3 border-b border-[#171717] pb-2.5">
              <SearchIcon className="h-5 w-5 shrink-0 text-[#777777]" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm áo, quần, chất liệu..."
                className="w-full bg-transparent text-sm text-[#171717] placeholder-[#777777] outline-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-[#777777] hover:text-[#171717]"
                >
                  Xóa
                </button>
              )}
              <button
                type="submit"
                className="bg-[#171717] px-4 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-white transition hover:bg-[#202020]"
              >
                Tìm
              </button>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                aria-label="Đóng tìm kiếm"
                className="p-1 text-[#777777] hover:text-[#171717]"
              >
                <CloseIcon className="h-4 w-4" />
              </button>
            </form>

            {categories.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-[11px] uppercase tracking-[0.14em] text-[#777777]">
                  Danh mục:
                </span>
                {categories.map((c) => (
                  <Link
                    key={c._id}
                    to={`/products?category=${c._id}`}
                    className="border border-[#EAEAEA] px-3 py-1 text-xs text-[#202020] transition hover:border-[#171717]"
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="animate-fade-in fixed inset-0 bg-black/35 backdrop-blur-[1px]"
            onClick={() => setMobileOpen(false)}
          />
          <div className="animate-slide-in-left relative z-10 flex h-full w-80 max-w-[85vw] flex-col justify-between bg-white">
            <div className="overflow-y-auto p-6">
              <div className="mb-8 flex items-center justify-between border-b border-[#EAEAEA] pb-4">
                <span className="text-sm font-semibold uppercase tracking-[0.22em] text-[#171717]">
                  GIN SHOP
                </span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Đóng menu"
                  className="p-1 text-[#171717]"
                >
                  <CloseIcon className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.key}
                    to={item.to}
                    className="block border-b border-[#EAEAEA] pb-3 text-sm font-medium uppercase tracking-[0.14em] text-[#202020]"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {categories.length > 0 && (
                <div className="mt-6">
                  <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#777777]">
                    Danh mục
                  </p>
                  <div className="space-y-2.5">
                    {categories.map((c) => (
                      <Link
                        key={c._id}
                        to={`/products?category=${c._id}`}
                        className="block text-sm text-[#202020] hover:text-[#B9A58A]"
                      >
                        {c.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {isStaff && (
                <div className="mt-8 border-t border-[#EAEAEA] pt-5">
                  <p className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#777777]">
                    Khu vực quản trị
                  </p>
                  <div className="space-y-2.5 text-sm">
                    <Link to="/admin" className="block text-[#202020]">
                      Thống kê tổng quan
                    </Link>
                    <Link to="/admin/orders" className="block text-[#202020]">
                      Quản lý đơn hàng
                    </Link>
                    <Link to="/admin/products" className="block text-[#202020]">
                      Quản lý sản phẩm
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-[#EAEAEA] bg-[#F5F4F0] p-6">
              {user ? (
                <div className="space-y-3">
                  <div>
                    <p className="text-xs font-medium text-[#171717]">{user.name}</p>
                    <p className="text-[11px] text-[#777777]">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs">
                    {showShopUtilities && (
                      <Link to="/orders" className="underline">
                        Đơn hàng
                      </Link>
                    )}
                    {isCustomer && (
                      <Link to="/wishlist" className="underline">
                        Yêu thích
                      </Link>
                    )}
                    <button type="button" onClick={handleLogout} className="text-[#777777] underline">
                      Đăng xuất
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    className="border border-[#171717] py-2.5 text-center text-xs font-medium uppercase tracking-[0.12em] text-[#171717]"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to="/register"
                    className="bg-[#171717] py-2.5 text-center text-xs font-medium uppercase tracking-[0.12em] text-white"
                  >
                    Đăng ký
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

