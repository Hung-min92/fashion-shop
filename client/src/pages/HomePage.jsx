import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGet } from "../api.js";
import heroBannerImg from "../assets/editorial/hero-banner.jpg";
import { ArrowRightIcon } from "../components/Icons.jsx";
import ProductCard from "../components/ProductCard.jsx";
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
    const findCatId = (keywords) => {
      const match = categories.find((c) =>
        keywords.some(
          (k) =>
            c.slug?.toLowerCase().includes(k) ||
            c.name?.toLowerCase().includes(k)
        )
      );
      return match ? `/products?category=${match._id}` : "/products";
    };

    const productThumbs = products.flatMap((p) => p.images || []);

    return [
      {
        title: "Men",
        subtitle: "Phom dáng chuẩn mực",
        to: findCatId(["nam", "men"]),
        image: productThumbs[0] || heroBannerImg,
        tone: "bg-[#EAE7E1]",
      },
      {
        title: "Women",
        subtitle: "Thanh lịch hằng ngày",
        to: findCatId(["nu", "women"]),
        image: productThumbs[1] || heroBannerImg,
        tone: "bg-[#E5E1D8]",
      },
      {
        title: "Accessories",
        subtitle: "Điểm nhấn tinh giản",
        to: findCatId(["phu-kien", "accessories", "tui"]),
        image: productThumbs[2] || heroBannerImg,
        tone: "bg-[#DDD8CE]",
      },
    ];
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

  return (
    <div className="bg-white">
      {/* C. Hero Banner */}
      <section className="relative w-full overflow-hidden bg-[#F5F4F0]">
        <div className="relative min-h-[70vh] w-full sm:min-h-[78vh] lg:aspect-[16/9] lg:max-h-[85vh]">
          <img
            src={heroBannerImg}
            alt="New Season 2026 — Timeless Style. Everyday Elegance."
            className="h-full w-full object-cover object-[75%_center] sm:object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F5F4F0]/90 via-[#F5F4F0]/45 to-transparent sm:from-[#F5F4F0]/75 sm:via-[#F5F4F0]/20" />

          <div className="absolute inset-0 mx-auto flex max-w-[1440px] items-end px-4 pb-12 sm:items-center sm:px-6 sm:pb-0 lg:px-10">
            <div className="animate-fade-in-up max-w-lg">
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[#777777]">
                NEW SEASON 2026
              </p>
              <h1 className="mt-3 font-serif text-3xl font-normal leading-[1.12] tracking-tight text-[#171717] sm:text-5xl lg:text-[54px]">
                Timeless Style. Everyday Elegance.
              </h1>
              <p className="mt-4 text-sm leading-relaxed text-[#202020] sm:text-base">
                Khám phá bộ sưu tập mới.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  to="/products"
                  className="bg-[#171717] px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white transition hover:bg-[#202020]"
                >
                  Khám phá bộ sưu tập
                </Link>
                <Link
                  to="/products?sort=newest"
                  className="border border-[#171717] bg-white/80 px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[#171717] backdrop-blur-sm transition hover:bg-[#171717] hover:text-white"
                >
                  Mua ngay
                </Link>
              </div>
            </div>
          </div>
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

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {categoryCards.map((cat) => (
            <Link key={cat.title} to={cat.to} className="group block">
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

        {/* Real Categories Quick Links from Backend */}
        {categories.length > 0 && (
          <div className="mt-10 flex flex-wrap items-center gap-3 pt-2">
            <span className="text-[11px] uppercase tracking-[0.16em] text-[#777777]">
              Danh mục hiện có:
            </span>
            {categories.map((c) => (
              <Link
                key={c._id}
                to={`/products?category=${c._id}`}
                className="border border-[#EAEAEA] px-4 py-1.5 text-xs text-[#202020] transition hover:border-[#171717]"
              >
                {c.name}
              </Link>
            ))}
          </div>
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
            src={heroBannerImg}
            alt="Less, But Better — Designed for everyday living."
            className="h-full w-full scale-105 object-cover object-center opacity-55"
          />
          <div className="absolute inset-0 bg-[#171717]/45" />

          <div className="absolute inset-0 mx-auto flex max-w-[1440px] flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-10">
            <p className="text-[11px] font-medium uppercase tracking-[0.26em] text-[#B9A58A]">
              Editorial · Autumn / Winter
            </p>
            <h2 className="mt-3 font-serif text-3xl font-normal tracking-wide text-white sm:text-5xl">
              LESS, BUT BETTER.
            </h2>
            <p className="mt-3 max-w-md text-sm text-white/85">
              Designed for everyday living.
            </p>
            <Link
              to="/products"
              className="mt-8 border border-white px-8 py-3.5 text-[11px] font-medium uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#171717]"
            >
              EXPLORE COLLECTION
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
              src={heroBannerImg}
              alt="Brand Story — Simplicity is the ultimate sophistication"
              loading="lazy"
              className="h-full w-full object-cover object-right transition duration-700 hover:scale-[1.02]"
            />
          </div>

          <div className="max-w-lg lg:py-8">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[#B9A58A]">
              Our Philosophy
            </p>
            <h2 className="mt-3 font-serif text-2xl font-normal leading-snug text-[#171717] sm:text-4xl">
              SIMPLICITY IS THE ULTIMATE SOPHISTICATION.
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

