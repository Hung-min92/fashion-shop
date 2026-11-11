import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { apiGet } from "../api.js";
import {
  ChevronRightIcon,
  CloseIcon,
  FilterIcon,
  SearchIcon,
} from "../components/Icons.jsx";
import ProductCard from "../components/ProductCard.jsx";
import { getColorHex } from "../utils/colorUtils.js";

const SORTS = [
  { value: "newest", label: "Mới nhất" },
  { value: "popular", label: "Nổi bật & đánh giá cao" },
  { value: "price_asc", label: "Giá: Thấp đến cao" },
  { value: "price_desc", label: "Giá: Cao đến thấp" },
];

const PRICE_PRESETS = [
  { label: "Dưới 200.000đ", min: "", max: "200000" },
  { label: "200.000đ – 500.000đ", min: "200000", max: "500000" },
  { label: "Trên 500.000đ", min: "500000", max: "" },
];

function FilterPanelContent({
  searchInput,
  setSearchInput,
  categories,
  activeCategory,
  minInput,
  setMinInput,
  maxInput,
  setMaxInput,
  minPrice,
  maxPrice,
  availableSizes,
  availableColors,
  selectedSize,
  selectedColor,
  onSearchSubmit,
  onSelectCategory,
  onApplyPrice,
  onSelectPricePreset,
  onToggleParam,
  onResetAll,
}) {
  return (
    <div className="space-y-8 text-sm">
      {/* Search inside filter */}
      <div>
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#171717]">
          Tìm kiếm
        </h3>
        <form onSubmit={onSearchSubmit} className="flex border border-[#EAEAEA] bg-white focus-within:border-[#171717]">
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Tên sản phẩm..."
            className="w-full bg-transparent px-3 py-2 text-xs text-[#171717] placeholder-[#777777] outline-none"
          />
          <button
            type="submit"
            aria-label="Tìm kiếm"
            className="px-3 text-[#777777] transition hover:text-[#171717]"
          >
            <SearchIcon className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Category */}
      <div className="border-t border-[#EAEAEA] pt-6">
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#171717]">
          Danh mục
        </h3>
        <ul className="space-y-2 text-xs">
          <li>
            <button
              type="button"
              onClick={() => onSelectCategory("")}
              className={`block w-full py-1 text-left transition ${
                !activeCategory
                  ? "font-medium text-[#171717] underline underline-offset-4"
                  : "text-[#777777] hover:text-[#171717]"
              }`}
            >
              Tất cả sản phẩm
            </button>
          </li>
          {categories.map((c) => {
            const isSelected = activeCategory === c._id;
            return (
              <li key={c._id}>
                <button
                  type="button"
                  onClick={() => onSelectCategory(c._id)}
                  className={`block w-full py-1 text-left transition ${
                    isSelected
                      ? "font-medium text-[#171717] underline underline-offset-4"
                      : "text-[#777777] hover:text-[#171717]"
                  }`}
                >
                  {c.name}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Price */}
      <div className="border-t border-[#EAEAEA] pt-6">
        <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#171717]">
          Khoảng giá
        </h3>
        <div className="mb-3 space-y-1.5">
          {PRICE_PRESETS.map((preset) => {
            const active = minPrice === preset.min && maxPrice === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => onSelectPricePreset(preset.min, preset.max)}
                className={`block w-full py-1 text-left text-xs transition ${
                  active
                    ? "font-medium text-[#171717] underline underline-offset-4"
                    : "text-[#777777] hover:text-[#171717]"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={onApplyPrice} className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              placeholder="Từ (đ)"
              inputMode="numeric"
              className="border border-[#EAEAEA] bg-white px-2.5 py-2 text-xs text-[#171717] placeholder-[#777777] outline-none focus:border-[#171717]"
            />
            <input
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              placeholder="Đến (đ)"
              inputMode="numeric"
              className="border border-[#EAEAEA] bg-white px-2.5 py-2 text-xs text-[#171717] placeholder-[#777777] outline-none focus:border-[#171717]"
            />
          </div>
          <button
            type="submit"
            className="w-full border border-[#171717] py-2 text-[11px] font-medium uppercase tracking-[0.14em] text-[#171717] transition hover:bg-[#171717] hover:text-white"
          >
            Áp dụng giá
          </button>
        </form>
      </div>

      {/* Size */}
      {availableSizes.length > 0 && (
        <div className="border-t border-[#EAEAEA] pt-6">
          <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#171717]">
            Kích thước
          </h3>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((s) => {
              const active = selectedSize === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => onToggleParam("size", s)}
                  className={`min-w-[40px] border px-2.5 py-1.5 text-xs transition ${
                    active
                      ? "border-[#171717] bg-[#171717] text-white"
                      : "border-[#EAEAEA] bg-white text-[#202020] hover:border-[#171717]"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Color */}
      {availableColors.length > 0 && (
        <div className="border-t border-[#EAEAEA] pt-6">
          <h3 className="mb-3 text-[11px] font-medium uppercase tracking-[0.16em] text-[#171717]">
            Màu sắc
          </h3>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((c) => {
              const active = selectedColor === c;
              const hex = getColorHex(c);
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => onToggleParam("color", c)}
                  className={`flex items-center gap-1.5 border px-2.5 py-1.5 text-xs transition ${
                    active
                      ? "border-[#171717] bg-[#171717] text-white"
                      : "border-[#EAEAEA] bg-white text-[#202020] hover:border-[#171717]"
                  }`}
                >
                  {hex && (
                    <span
                      className="h-2.5 w-2.5 rounded-full border border-black/15"
                      style={{ backgroundColor: hex }}
                    />
                  )}
                  <span>{c}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Reset */}
      <div className="border-t border-[#EAEAEA] pt-5">
        <button
          type="button"
          onClick={onResetAll}
          className="text-xs text-[#777777] underline underline-offset-4 transition hover:text-[#171717]"
        >
          Xóa tất cả bộ lọc
        </button>
      </div>
    </div>
  );
}

export default function ProductListPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const search = params.get("search") || "";
  const paramCategory = params.get("category") || "";
  const minPrice = params.get("minPrice") || "";
  const maxPrice = params.get("maxPrice") || "";
  const sort = params.get("sort") || "newest";
  const selectedSize = params.get("size") || "";
  const selectedColor = params.get("color") || "";
  const page = Number(params.get("page")) || 1;

  const [searchInput, setSearchInput] = useState(search);
  const [minInput, setMinInput] = useState(minPrice);
  const [maxInput, setMaxInput] = useState(maxPrice);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loadedKey, setLoadedKey] = useState(null);
  const [error, setError] = useState("");

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    apiGet("/api/categories")
      .then((body) => setCategories(body.data || []))
      .catch(() => {});
  }, []);

  const slugCategory = useMemo(() => {
    if (!slug || categories.length === 0) return null;
    return categories.find((c) => c.slug === slug) || null;
  }, [slug, categories]);

  const effectiveCategory = paramCategory || slugCategory?._id || "";

  const activeCategoryObj = useMemo(
    () => categories.find((c) => c._id === effectiveCategory) || null,
    [categories, effectiveCategory]
  );

  const hasVariantFilter = Boolean(selectedSize || selectedColor);

  const requestKey = useMemo(() => {
    const apiParams = new URLSearchParams();
    if (search) apiParams.set("search", search);
    if (effectiveCategory) apiParams.set("category", effectiveCategory);
    if (minPrice) apiParams.set("minPrice", minPrice);
    if (maxPrice) apiParams.set("maxPrice", maxPrice);
    apiParams.set("sort", sort === "popular" ? "newest" : sort);
    apiParams.set("page", hasVariantFilter ? "1" : String(page));
    apiParams.set("limit", hasVariantFilter ? "50" : "12");
    return apiParams.toString();
  }, [search, effectiveCategory, minPrice, maxPrice, sort, page, hasVariantFilter]);

  const loading = !error && (Boolean(slug && categories.length === 0) || loadedKey !== requestKey);

  useEffect(() => {
    if (slug && categories.length === 0) return;

    let ignore = false;

    apiGet(`/api/products?${requestKey}`)
      .then((body) => {
        if (ignore) return;
        setProducts(body.data || []);
        setTotalPages(body.totalPages || 1);
        setTotalItems(body.totalItems || 0);
        setError("");
        setLoadedKey(requestKey);
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message);
          setLoadedKey(requestKey);
        }
      });

    return () => {
      ignore = true;
    };
  }, [slug, categories.length, requestKey]);

  const availableSizes = useMemo(() => {
    const set = new Set();
    products.forEach((p) => p.variants?.forEach((v) => set.add(v.size)));
    return [...set];
  }, [products]);

  const availableColors = useMemo(() => {
    const set = new Set();
    products.forEach((p) => p.variants?.forEach((v) => set.add(v.color)));
    return [...set];
  }, [products]);

  const displayedProducts = useMemo(() => {
    let list = products;
    if (selectedSize || selectedColor) {
      list = list.filter((p) =>
        p.variants?.some(
          (v) =>
            (!selectedSize || v.size === selectedSize) &&
            (!selectedColor || v.color === selectedColor)
        )
      );
    }
    if (sort === "popular") {
      list = [...list].sort(
        (a, b) =>
          (b.ratingCount || 0) - (a.ratingCount || 0) ||
          (b.ratingAverage || 0) - (a.ratingAverage || 0)
      );
    }
    return list;
  }, [products, selectedSize, selectedColor, sort]);

  function update(changes) {
    const next = new URLSearchParams(params);
    for (const [key, value] of Object.entries(changes)) {
      if (value === "" || value == null) next.delete(key);
      else next.set(key, String(value));
    }
    if (!("page" in changes)) next.delete("page");
    setParams(next);
  }

  function handleSelectCategory(catId) {
    if (slug) {
      const next = new URLSearchParams(params);
      next.delete("page");
      if (catId) next.set("category", catId);
      else next.delete("category");
      navigate(`/products${next.toString() ? `?${next.toString()}` : ""}`);
    } else {
      update({ category: catId });
    }
  }

  function handleSearchSubmit(e) {
    e.preventDefault();
    update({ search: searchInput.trim() });
    setMobileDrawerOpen(false);
  }

  function handleApplyPrice(e) {
    e.preventDefault();
    update({ minPrice: minInput.trim(), maxPrice: maxInput.trim() });
    setMobileDrawerOpen(false);
  }

  function handleSelectPricePreset(min, max) {
    setMinInput(min);
    setMaxInput(max);
    update({ minPrice: min, maxPrice: max });
  }

  function handleToggleParam(key, value) {
    const current = params.get(key) || "";
    update({ [key]: current === value ? "" : value });
  }

  function resetAll() {
    setSearchInput("");
    setMinInput("");
    setMaxInput("");
    if (slug) {
      navigate("/products");
    } else {
      setParams({});
    }
    setMobileDrawerOpen(false);
  }

  const activeFiltersCount = [
    search,
    effectiveCategory,
    minPrice || maxPrice ? "price" : "",
    selectedSize,
    selectedColor,
  ].filter(Boolean).length;

  const displayedTotal = hasVariantFilter ? displayedProducts.length : totalItems;

  return (
    <div className="animate-fade-in">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-[#777777]">
        <Link to="/" className="transition hover:text-[#171717]">
          Trang chủ
        </Link>
        <ChevronRightIcon className="h-3 w-3" />
        <Link to="/products" className="transition hover:text-[#171717]">
          Bộ sưu tập
        </Link>
        {activeCategoryObj && (
          <>
            <ChevronRightIcon className="h-3 w-3" />
            <span className="text-[#171717]">{activeCategoryObj.name}</span>
          </>
        )}
      </nav>

      {/* Editorial Category Banner */}
      <div className="mb-8 border-b border-[#EAEAEA] bg-[#F5F4F0] px-6 py-10 sm:px-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#777777]">
          Collection 2026
        </p>
        <h1 className="mt-2 font-serif text-3xl font-normal text-[#171717] sm:text-4xl">
          {activeCategoryObj ? activeCategoryObj.name : "Tất cả sản phẩm"}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-[#777777]">
          {activeCategoryObj
            ? `Khám phá các thiết kế ${activeCategoryObj.name.toLowerCase()} tối giản, chuẩn phom dáng và dễ phối đồ hằng ngày.`
            : "Những thiết kế cơ bản được tinh chỉnh từng đường nét, ưu tiên chất liệu tự nhiên và sự thoải mái bền lâu."}
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-[#EAEAEA] pb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Desktop Sidebar Toggle */}
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="hidden items-center gap-2 border border-[#EAEAEA] px-3.5 py-2 text-xs uppercase tracking-[0.14em] text-[#171717] transition hover:border-[#171717] lg:inline-flex"
          >
            <FilterIcon className="h-3.5 w-3.5" />
            <span>{sidebarOpen ? "Ẩn bộ lọc" : "Hiện bộ lọc"}</span>
            {activeFiltersCount > 0 && (
              <span className="ml-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#171717] px-1 text-[10px] text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {/* Mobile Drawer Trigger */}
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="inline-flex items-center gap-2 border border-[#EAEAEA] px-3.5 py-2 text-xs uppercase tracking-[0.14em] text-[#171717] transition hover:border-[#171717] lg:hidden"
          >
            <FilterIcon className="h-3.5 w-3.5" />
            <span>Bộ lọc</span>
            {activeFiltersCount > 0 && (
              <span className="ml-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#171717] px-1 text-[10px] text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {!loading && !error && (
            <span className="text-xs text-[#777777]">
              {displayedTotal} sản phẩm
            </span>
          )}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2.5">
          <label
            htmlFor="product-sort"
            className="text-[11px] uppercase tracking-[0.14em] text-[#777777]"
          >
            Sắp xếp:
          </label>
          <select
            id="product-sort"
            value={sort}
            onChange={(e) => update({ sort: e.target.value })}
            className="border border-[#EAEAEA] bg-white px-3 py-2 text-xs text-[#171717] outline-none transition focus:border-[#171717]"
          >
            {SORTS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Active Filter Chips */}
      {activeFiltersCount > 0 && (
        <div className="mb-6 flex flex-wrap items-center gap-2">
          {search && (
            <button
              type="button"
              onClick={() => update({ search: "" })}
              className="inline-flex items-center gap-1.5 bg-[#F5F4F0] px-3 py-1 text-xs text-[#171717] transition hover:bg-[#eae8e1]"
            >
              <span>Từ khóa: &ldquo;{search}&rdquo;</span>
              <CloseIcon className="h-3 w-3" />
            </button>
          )}
          {activeCategoryObj && (
            <button
              type="button"
              onClick={() => handleSelectCategory("")}
              className="inline-flex items-center gap-1.5 bg-[#F5F4F0] px-3 py-1 text-xs text-[#171717] transition hover:bg-[#eae8e1]"
            >
              <span>Danh mục: {activeCategoryObj.name}</span>
              <CloseIcon className="h-3 w-3" />
            </button>
          )}
          {(minPrice || maxPrice) && (
            <button
              type="button"
              onClick={() => update({ minPrice: "", maxPrice: "" })}
              className="inline-flex items-center gap-1.5 bg-[#F5F4F0] px-3 py-1 text-xs text-[#171717] transition hover:bg-[#eae8e1]"
            >
              <span>
                Giá: {minPrice ? `${Number(minPrice).toLocaleString("vi-VN")}đ` : "0đ"} –{" "}
                {maxPrice ? `${Number(maxPrice).toLocaleString("vi-VN")}đ` : "∞"}
              </span>
              <CloseIcon className="h-3 w-3" />
            </button>
          )}
          {selectedSize && (
            <button
              type="button"
              onClick={() => update({ size: "" })}
              className="inline-flex items-center gap-1.5 bg-[#F5F4F0] px-3 py-1 text-xs text-[#171717] transition hover:bg-[#eae8e1]"
            >
              <span>Size: {selectedSize}</span>
              <CloseIcon className="h-3 w-3" />
            </button>
          )}
          {selectedColor && (
            <button
              type="button"
              onClick={() => update({ color: "" })}
              className="inline-flex items-center gap-1.5 bg-[#F5F4F0] px-3 py-1 text-xs text-[#171717] transition hover:bg-[#eae8e1]"
            >
              <span>Màu: {selectedColor}</span>
              <CloseIcon className="h-3 w-3" />
            </button>
          )}
          <button
            type="button"
            onClick={resetAll}
            className="ml-1 text-xs text-[#777777] underline underline-offset-4 hover:text-[#171717]"
          >
            Xóa hết
          </button>
        </div>
      )}

      {/* Main Layout: Sidebar + Product Grid */}
      <div className="flex gap-10">
        {/* Desktop Sidebar */}
        {sidebarOpen && (
          <aside className="hidden w-60 shrink-0 lg:block">
            <FilterPanelContent
              searchInput={searchInput}
              setSearchInput={setSearchInput}
              categories={categories}
              activeCategory={effectiveCategory}
              minInput={minInput}
              setMinInput={setMinInput}
              maxInput={maxInput}
              setMaxInput={setMaxInput}
              minPrice={minPrice}
              maxPrice={maxPrice}
              availableSizes={availableSizes}
              availableColors={availableColors}
              selectedSize={selectedSize}
              selectedColor={selectedColor}
              onSearchSubmit={handleSearchSubmit}
              onSelectCategory={handleSelectCategory}
              onApplyPrice={handleApplyPrice}
              onSelectPricePreset={handleSelectPricePreset}
              onToggleParam={handleToggleParam}
              onResetAll={resetAll}
            />
          </aside>
        )}

        {/* Right Content */}
        <div className="min-w-0 flex-1">
          {loading ? (
            <div
              className={`grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 ${
                sidebarOpen ? "md:grid-cols-3" : "md:grid-cols-3 lg:grid-cols-4"
              }`}
            >
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] w-full bg-[#F5F4F0]" />
                  <div className="mt-3 h-3 w-20 bg-[#F5F4F0]" />
                  <div className="mt-2 h-4 w-3/4 bg-[#F5F4F0]" />
                  <div className="mt-2 h-4 w-24 bg-[#F5F4F0]" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="border border-red-200 bg-white p-8 text-center">
              <p className="text-sm text-red-700">Lỗi: {error}</p>
            </div>
          ) : displayedProducts.length === 0 ? (
            <div className="border border-[#EAEAEA] bg-[#F5F4F0]/50 px-6 py-16 text-center">
              <p className="font-serif text-xl text-[#171717]">
                Không tìm thấy sản phẩm phù hợp
              </p>
              <p className="mt-2 text-sm text-[#777777]">
                Hãy thử thay đổi từ khóa hoặc xóa bớt bộ lọc để xem thêm thiết kế khác.
              </p>
              <button
                type="button"
                onClick={resetAll}
                className="mt-6 border border-[#171717] px-6 py-2.5 text-xs font-medium uppercase tracking-[0.14em] text-[#171717] transition hover:bg-[#171717] hover:text-white"
              >
                Xem tất cả sản phẩm
              </button>
            </div>
          ) : (
            <div
              className={`grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 ${
                sidebarOpen ? "md:grid-cols-3" : "md:grid-cols-3 lg:grid-cols-4"
              }`}
            >
              {displayedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {!hasVariantFilter && totalPages > 1 && (
            <div className="mt-14 flex items-center justify-center gap-2 border-t border-[#EAEAEA] pt-8">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => {
                  update({ page: page - 1 });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="border border-[#EAEAEA] px-4 py-2 text-xs uppercase tracking-[0.14em] text-[#171717] transition hover:border-[#171717] disabled:cursor-not-allowed disabled:opacity-35"
              >
                Trước
              </button>

              {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((pNum) => (
                <button
                  key={pNum}
                  type="button"
                  onClick={() => {
                    update({ page: pNum });
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`h-9 min-w-[36px] border px-2 text-xs transition ${
                    pNum === page
                      ? "border-[#171717] bg-[#171717] text-white"
                      : "border-[#EAEAEA] text-[#202020] hover:border-[#171717]"
                  }`}
                >
                  {pNum}
                </button>
              ))}

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => {
                  update({ page: page + 1 });
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="border border-[#EAEAEA] px-4 py-2 text-xs uppercase tracking-[0.14em] text-[#171717] transition hover:border-[#171717] disabled:cursor-not-allowed disabled:opacity-35"
              >
                Sau
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="animate-fade-in fixed inset-0 bg-black/40"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="animate-slide-in-left relative z-10 flex h-full w-80 max-w-[88vw] flex-col bg-white">
            <div className="flex items-center justify-between border-b border-[#EAEAEA] px-6 py-4">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-[#171717]">
                Bộ lọc sản phẩm
              </span>
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Đóng bộ lọc"
                className="p-1 text-[#171717]"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <FilterPanelContent
                searchInput={searchInput}
                setSearchInput={setSearchInput}
                categories={categories}
                activeCategory={effectiveCategory}
                minInput={minInput}
                setMinInput={setMinInput}
                maxInput={maxInput}
                setMaxInput={setMaxInput}
                minPrice={minPrice}
                maxPrice={maxPrice}
                availableSizes={availableSizes}
                availableColors={availableColors}
                selectedSize={selectedSize}
                selectedColor={selectedColor}
                onSearchSubmit={handleSearchSubmit}
                onSelectCategory={(catId) => {
                  handleSelectCategory(catId);
                  setMobileDrawerOpen(false);
                }}
                onApplyPrice={handleApplyPrice}
                onSelectPricePreset={(min, max) => {
                  handleSelectPricePreset(min, max);
                  setMobileDrawerOpen(false);
                }}
                onToggleParam={handleToggleParam}
                onResetAll={resetAll}
              />
            </div>
            <div className="border-t border-[#EAEAEA] p-4">
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full bg-[#171717] py-3 text-xs font-medium uppercase tracking-[0.16em] text-white"
              >
                Xem {displayedTotal} sản phẩm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
