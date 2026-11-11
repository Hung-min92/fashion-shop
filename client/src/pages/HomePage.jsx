import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api.js";
import { ArrowRightIcon, ChevronRightIcon } from "../components/Icons.jsx";
import ProductCard from "../components/ProductCard.jsx";
import {
  BRAND_STORY_BANNER,
  CATEGORY_CARD_TONES,
  CATEGORY_FALLBACK_IMAGES,
  EDITORIAL_BANNER,
  HERO_AUTOPLAY_MS,
  HERO_SLIDES,
} from "../data/banners.js";
import { useToast } from "../ToastContext.jsx";

function ProductGridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:gap-x-6 lg:grid-cols-4">
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[3/4] w-full bg-[#F5F4F0]" />
          <div className="mt-3 h-3 w-20 bg-[#F5F4F0]" />
          <div className="mt-2 h-4 w-3/4 bg-[#F5F4F0]" />
          <div className="mt-2 h-4 w-24 bg-[#F5F4F0]" />
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const [slideIndex, setSlideIndex] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const touchStartX = useRef(null);

  useEffect(() => {
    let ignore = false;

    Promise.all([
      apiGet("/api/products?sort=newest&limit=12"),
      apiGet("/api/categories"),
    ])
      .then(([prodBody, catBody]) => {
        if (ignore) return;
        setProducts(prodBody.data || []);
        setCategories(catBody.data || []);
      })
      .catch(() => {})
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (HERO_SLIDES.length <= 1 || heroPaused) return;
    const timer = setTimeout(() => {
      setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, HERO_AUTOPLAY_MS);
    return () => clearTimeout(timer);
  }, [heroPaused, slideIndex]);

  const newArrivals = useMemo(() => products.slice(0, 4), [products]);

  const bestSellers = useMemo(() => {
    if (products.length === 0) return [];
    const newIds = new Set(newArrivals.map((p) => p._id));
    const remaining = products.filter((p) => !newIds.has(p._id));
    const pool = remaining.length >= 4 ? remaining : products;

    return [...pool]
      .sort(
        (a, b) =>
          (b.ratingCount || 0) - (a.ratingCount || 0) ||
          (b.ratingAverage || 0) - (a.ratingAverage || 0)
      )
      .slice(0, 4);
  }, [products, newArrivals]);

  const categoryCards = useMemo(() => {
    if (categories.length === 0) return [];

    return categories.slice(0, 6).map((cat, idx) => {
      const catProductImg = products.find(
        (p) => p.category?._id === cat._id && p.images?.length > 0
      )?.images[0];

      return {
        id: cat._id,
        title: cat.name,
        subtitle: `Khám phá các thiết kế ${cat.name.toLowerCase()}`,
        to: `/categories/${cat.slug}`,
        image:
          catProductImg ||
          CATEGORY_FALLBACK_IMAGES[cat.slug] ||
          CATEGORY_FALLBACK_IMAGES.default,
        tone: CATEGORY_CARD_TONES[idx % CATEGORY_CARD_TONES.length],
      };
    });
  }, [categories, products]);

  function handleSubscribe(e) {
    e.preventDefault();
    const cleaned = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      showToast("Vui lòng nhập địa chỉ email hợp lệ", { type: "error" });
      return;
    }
    setSubscribed(true);
    setEmail("");
    showToast("Đăng ký nhận bản tin thành công");
  }

  const activeSlide = HERO_SLIDES[slideIndex] || HERO_SLIDES[0];
  const isDarkSlide = activeSlide.theme === "dark";

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    if (delta < 0) {
      setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    } else {
      setSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
    }
  }

  return (
    <div className="bg-white">
      {/* C. Hero Banner (Auto-playing Multi-slide Carousel) */}
      <section
        className={`relative w-full overflow-hidden transition-colors duration-700 ${
          isDarkSlide ? "bg-[#171717]" : "bg-[#F5F4F0]"
        }`}
        onMouseEnter={() => setHeroPaused(true)}
        onMouseLeave={() => setHeroPaused(false)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="relative min-h-[70vh] w-full sm:min-h-[78vh] lg:aspect-[16/9] lg:max-h-[85vh]">
          {HERO_SLIDES.map((slide, idx) => (
            <img
              key={slide.id}
              src={slide.image}
              alt={`${slide.eyebrow} — ${slide.title}`}
              className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 ease-out ${
                slide.imageClass || "object-center"
              } ${idx === slideIndex ? "opacity-100" : "pointer-events-none opacity-0"}`}
            />
          ))}

          <div
            className={`absolute inset-0 transition-colors duration-700 ${
              isDarkSlide
                ? "bg-gradient-to-r from-[#171717]/80 via-[#171717]/40 to-transparent"
                : "bg-gradient-to-r from-[#F5F4F0]/90 via-[#F5F4F0]/45 to-transparent sm:from-[#F5F4F0]/75 sm:via-[#F5F4F0]/20"
            }`}
          />

          <div className="absolute inset-0 mx-auto flex max-w-[1440px] items-end px-4 pb-14 sm:items-center sm:px-6 sm:pb-0 lg:px-10">
            <div key={activeSlide.id} className="animate-fade-in-up max-w-lg">
              <p
                className={`text-[11px] font-medium uppercase tracking-[0.24em] ${
                  isDarkSlide ? "text-[#B9A58A]" : "text-[#777777]"
                }`}
              >
                {activeSlide.eyebrow}
              </p>
              <h1
                className={`mt-3 font-serif text-3xl font-normal leading-[1.12] tracking-tight sm:text-5xl lg:text-[54px] ${
                  isDarkSlide ? "text-white" : "text-[#171717]"
                }`}
              >
                {activeSlide.title}
              </h1>
              <p
                className={`mt-4 text-sm leading-relaxed sm:text-base ${
                  isDarkSlide ? "text-white/85" : "text-[#202020]"
                }`}
              >
                {activeSlide.subtitle}
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  to={activeSlide.primaryCta.to}
                  className={`px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] transition ${
                    isDarkSlide
                      ? "bg-white text-[#171717] hover:bg-[#F5F4F0]"
                      : "bg-[#171717] text-white hover:bg-[#202020]"
                  }`}
                >
                  {activeSlide.primaryCta.label}
                </Link>
                {activeSlide.secondaryCta && (
                  <Link
                    to={activeSlide.secondaryCta.to}
                    className={`border px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] backdrop-blur-sm transition ${
                      isDarkSlide
                        ? "border-white text-white hover:bg-white hover:text-[#171717]"
                        : "border-[#171717] bg-white/80 text-[#171717] hover:bg-[#171717] hover:text-white"
                    }`}
                  >
                    {activeSlide.secondaryCta.label}
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Slider Controls + Animated Progress Bar */}
          {HERO_SLIDES.length > 1 && (
            <div className="absolute bottom-5 left-0 right-0 z-10 mx-auto flex max-w-[1440px] items-center justify-between px-4 sm:px-6 lg:px-10">
              <div className="flex items-center gap-2.5">
                {HERO_SLIDES.map((s, idx) => {
                  const active = idx === slideIndex;
                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSlideIndex(idx)}
                      aria-label={`Chuyển đến banner ${idx + 1}`}
                      className={`relative h-[3px] overflow-hidden transition-all duration-300 ${
                        active ? "w-12" : "w-5"
                      } ${isDarkSlide ? "bg-white/30" : "bg-[#171717]/20"}`}
                    >
                      {active && (
                        <span
                          key={`${slideIndex}-${heroPaused}`}
                          className={`block h-full w-full origin-left ${
                            isDarkSlide ? "bg-white" : "bg-[#171717]"
                          }`}
                          style={{
                            animation: heroPaused
                              ? "none"
                              : `heroProgress ${HERO_AUTOPLAY_MS}ms linear forwards`,
                          }}
                        />
                      )}
                    </button>
                  );
                })}
                <span
                  className={`ml-2 text-[10px] tracking-[0.18em] ${
                    isDarkSlide ? "text-white/70" : "text-[#777777]"
                  }`}
                >
                  0{slideIndex + 1} / 0{HERO_SLIDES.length}
                </span>
              </div>

              <div className="hidden items-center gap-2 sm:flex">
                <button
                  type="button"
                  onClick={() =>
                    setSlideIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
                  }
                  aria-label="Banner trước"
                  className={`flex h-8 w-8 items-center justify-center border backdrop-blur-sm transition ${
                    isDarkSlide
                      ? "border-white/30 bg-black/30 text-white hover:border-white"
                      : "border-[#171717]/20 bg-white/80 text-[#171717] hover:border-[#171717]"
                  }`}
                >
                  <ChevronRightIcon className="h-3.5 w-3.5 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => setSlideIndex((prev) => (prev + 1) % HERO_SLIDES.length)}
                  aria-label="Banner tiếp theo"
                  className={`flex h-8 w-8 items-center justify-center border backdrop-blur-sm transition ${
                    isDarkSlide
                      ? "border-white/30 bg-black/30 text-white hover:border-white"
                      : "border-[#171717]/20 bg-white/80 text-[#171717] hover:border-[#171717]"
                  }`}
                >
                  <ChevronRightIcon className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* D. Shop By Category */}
      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#777777]">
              Curated Wardrobe
            </p>
            <h2 className="mt-1.5 font-serif text-2xl font-normal text-[#171717] sm:text-3xl">
              Shop By Category
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-[#171717] transition hover:text-[#B9A58A]"
          >
            <span>Tất cả sản phẩm</span>
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        {categoryCards.length > 0 ? (
          <div
            className={`grid grid-cols-1 gap-6 ${
              categoryCards.length === 1
                ? "max-w-md"
                : categoryCards.length === 2
                ? "sm:grid-cols-2"
                : "sm:grid-cols-2 md:grid-cols-3"
            }`}
          >
            {categoryCards.map((cat) => (
              <Link key={cat.id} to={cat.to} className="group block">
                <div className={`aspect-[3/4] w-full overflow-hidden ${cat.tone}`}>
                  <img
                    src={cat.image}
                    alt={cat.title}
                    loading="lazy"
                    className="h-full w-full object-cover object-center transition duration-700 ease-out group-hover:scale-[1.04]"
                  />
                </div>
                <div className="mt-4 flex items-center justify-between border-b border-[#EAEAEA] pb-3">
                  <div>
                    <h3 className="text-sm font-medium uppercase tracking-[0.16em] text-[#171717]">
                      {cat.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-[#777777]">{cat.subtitle}</p>
                  </div>
                  <ArrowRightIcon className="h-4 w-4 text-[#777777] transition-transform duration-300 group-hover:translate-x-1 group-hover:text-[#171717]" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          loading && (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="aspect-[3/4] animate-pulse bg-[#F5F4F0]" />
              ))}
            </div>
          )
        )}
      </section>

      {/* E. New Arrivals */}
      <section className="mx-auto max-w-[1440px] border-t border-[#EAEAEA] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-xl font-medium uppercase tracking-[0.2em] text-[#171717] sm:text-2xl">
              NEW ARRIVALS
            </h2>
            <p className="mt-2 text-sm text-[#777777]">
              Discover the latest additions to our collection.
            </p>
          </div>
          <Link
            to="/products?sort=newest"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-[#171717] transition hover:text-[#B9A58A]"
          >
            <span>View All</span>
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton />
        ) : newArrivals.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#777777]">
            Hiện chưa có sản phẩm mới.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {newArrivals.map((p) => (
              <ProductCard key={p._id} product={p} badge="NEW" />
            ))}
          </div>
        )}
      </section>

      {/* F. Editorial Banner */}
      <section className="relative w-full overflow-hidden bg-[#171717] text-white">
        <div className="relative min-h-[54vh] w-full lg:aspect-[21/9]">
          <img
            src={EDITORIAL_BANNER.image}
            alt={`${EDITORIAL_BANNER.title} — ${EDITORIAL_BANNER.subtitle}`}
            className="h-full w-full scale-105 object-cover object-center opacity-55"
          />
          <div className="absolute inset-0 bg-[#171717]/45" />

          <div className="absolute inset-0 mx-auto flex max-w-[1440px] flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#B9A58A]">
              {EDITORIAL_BANNER.eyebrow}
            </p>
            <h2 className="mt-3 font-serif text-3xl font-normal tracking-wide text-white sm:text-5xl">
              {EDITORIAL_BANNER.title}
            </h2>
            <p className="mt-3 max-w-md text-sm text-white/85">
              {EDITORIAL_BANNER.subtitle}
            </p>
            <Link
              to={EDITORIAL_BANNER.ctaTo}
              className="mt-8 border border-white px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#171717]"
            >
              {EDITORIAL_BANNER.ctaLabel}
            </Link>
          </div>
        </div>
      </section>

      {/* G. Best Sellers */}
      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-6 lg:px-10 lg:py-24">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#777777]">
              Most Loved Pieces
            </p>
            <h2 className="mt-1.5 text-xl font-medium uppercase tracking-[0.2em] text-[#171717] sm:text-2xl">
              BEST SELLERS
            </h2>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-[#171717] transition hover:text-[#B9A58A]"
          >
            <span>View All</span>
            <ArrowRightIcon className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton />
        ) : bestSellers.length === 0 ? (
          <p className="py-12 text-center text-sm text-[#777777]">
            Chưa có dữ liệu sản phẩm.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
            {bestSellers.map((p) => (
              <ProductCard key={p._id} product={p} badge={false} />
            ))}
          </div>
        )}
      </section>

      {/* H. Brand Story */}
      <section className="border-t border-[#EAEAEA] bg-white">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:px-10 lg:py-24">
          <div className="aspect-[4/5] w-full overflow-hidden bg-[#F5F4F0]">
            <img
              src={BRAND_STORY_BANNER.image}
              alt={BRAND_STORY_BANNER.title}
              loading="lazy"
              className="h-full w-full object-cover object-right transition duration-700 hover:scale-[1.02]"
            />
          </div>

          <div className="max-w-lg lg:py-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#B9A58A]">
              {BRAND_STORY_BANNER.eyebrow}
            </p>
            <h2 className="mt-3 font-serif text-2xl font-normal leading-snug text-[#171717] sm:text-4xl">
              {BRAND_STORY_BANNER.title}
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-[#777777]">
              Chúng tôi tin rằng một tủ đồ bền vững bắt đầu từ những thiết kế vượt thời gian.
              Mỗi sản phẩm được tinh giản tối đa chi tiết thừa, tập trung vào tỷ lệ cắt may
              chuẩn xác và đường kim mũi chỉ chỉn chu.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-[#777777]">
              Từ cotton hữu cơ thoáng khí, linen tự nhiên đến len dệt mịn, mọi chất liệu đều
              được tuyển chọn kỹ lưỡng để mang lại cảm giác dễ chịu suốt cả ngày dài.
            </p>
            <div className="mt-8 flex items-center gap-6 border-t border-[#EAEAEA] pt-6">
              <div>
                <p className="font-serif text-xl text-[#171717]">100%</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-[#777777]">
                  Chất liệu tuyển chọn
                </p>
              </div>
              <div className="h-8 w-[1px] bg-[#EAEAEA]" />
              <div>
                <p className="font-serif text-xl text-[#171717]">14 Ngày</p>
                <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-[#777777]">
                  Đổi trả linh hoạt
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* I. Newsletter */}
      <section className="border-t border-[#EAEAEA] bg-[#F5F4F0] px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-xl text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#777777]">
            Newsletter
          </p>
          <h2 className="mt-2 font-serif text-2xl font-normal tracking-wide text-[#171717] sm:text-3xl">
            STAY IN STYLE
          </h2>
          <p className="mt-3 text-sm text-[#777777]">
            Subscribe to receive updates on new collections and exclusive offers.
          </p>

          <form
            onSubmit={handleSubscribe}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:gap-0"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setSubscribed(false);
              }}
              placeholder="Nhập địa chỉ email của bạn"
              aria-label="Email nhận bản tin"
              className="flex-1 border border-[#EAEAEA] bg-white px-4 py-3 text-sm text-[#171717] placeholder-[#777777] outline-none transition focus:border-[#171717] sm:border-r-0"
            />
            <button
              type="submit"
              className="bg-[#171717] px-7 py-3 text-[11px] font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[#202020]"
            >
              Subscribe
            </button>
          </form>

          {subscribed && (
            <p className="mt-3 text-xs text-[#202020]">
              Cảm ơn bạn đã đăng ký. Bạn sẽ nhận được thông tin bộ sưu tập mới sớm nhất.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
