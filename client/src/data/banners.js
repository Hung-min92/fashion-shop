import heroBannerImg from "../assets/editorial/hero-banner.jpg";

/**
 * CẤU HÌNH BANNER TRANG CHỦ
 * -------------------------
 * Để thay ảnh hoặc thêm slide mới:
 * 1. Đặt file ảnh (.jpg / .png / .webp) vào thư mục: client/src/assets/editorial/
 * 2. Import ảnh ở đầu file này, ví dụ:
 *    import heroSlide2 from "../assets/editorial/hero-banner-2.jpg";
 *    import editorialImg from "../assets/editorial/editorial-banner.jpg";
 * 3. Gắn biến ảnh vào các object bên dưới (hoặc dùng trực tiếp URL ảnh từ Cloudinary / public).
 */

export const HERO_AUTOPLAY_MS = 4500;

export const HERO_SLIDES = [
  {
    id: "season-2026",
    eyebrow: "NEW SEASON 2026",
    title: "Timeless Style. Everyday Elegance.",
    subtitle: "Khám phá bộ sưu tập mới.",
    image: heroBannerImg,
    imageClass: "object-[75%_center] sm:object-center",
    theme: "light",
    primaryCta: { label: "Khám phá bộ sưu tập", to: "/products" },
    secondaryCta: { label: "Mua ngay", to: "/products?sort=newest" },
  },
  {
    id: "monochrome-edit",
    eyebrow: "MONOCHROME CAPSULE",
    title: "Less Noise. Pure Silhouette.",
    subtitle: "Tỷ lệ cắt may chuẩn xác trong từng thiết kế hằng ngày.",
    image: heroBannerImg,
    imageClass: "object-[80%_18%] scale-110 grayscale contrast-110",
    theme: "dark",
    primaryCta: { label: "Xem hàng mới về", to: "/products?sort=newest" },
    secondaryCta: { label: "Tất cả sản phẩm", to: "/products" },
  },
  {
    id: "essentials-edit",
    eyebrow: "ATELIER ESSENTIALS",
    title: "Crafted in Natural Fabrics.",
    subtitle: "Cotton hữu cơ, linen tự nhiên và bảng màu trung tính vượt thời gian.",
    image: heroBannerImg,
    imageClass: "object-[65%_30%] scale-105 sepia-[0.18]",
    theme: "light",
    primaryCta: { label: "Khám phá ngay", to: "/products" },
    secondaryCta: { label: "Giá tốt", to: "/products?sort=price_asc" },
  },
];

/**
 * Ảnh dự phòng theo slug danh mục trong database (khi sản phẩm thuộc danh mục chưa có ảnh).
 * Ví dụ: "ao-thun": aoThunBannerImg
 */
export const CATEGORY_FALLBACK_IMAGES = {
  default: heroBannerImg,
};

export const CATEGORY_CARD_TONES = [
  "bg-[#EAE7E1]",
  "bg-[#E5E1D8]",
  "bg-[#DDD8CE]",
];

export const EDITORIAL_BANNER = {
  eyebrow: "Editorial · Autumn / Winter",
  title: "LESS, BUT BETTER.",
  subtitle: "Designed for everyday living.",
  ctaLabel: "EXPLORE COLLECTION",
  ctaTo: "/products",
  image: heroBannerImg,
};

export const BRAND_STORY_BANNER = {
  eyebrow: "Our Philosophy",
  title: "SIMPLICITY IS THE ULTIMATE SOPHISTICATION.",
  image: heroBannerImg,
};
