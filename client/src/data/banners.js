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
    title: "GIN BOUTIQUE",
    image: "https://res.cloudinary.com/yvegjlxd/image/upload/v1794387471/BN1.jpg",
    imageClass: "object-center",
    theme: "dark",
  },
  {
    id: "monochrome-edit",
    image: "https://res.cloudinary.com/yvegjlxd/image/upload/v1794387471/BN4.jpg",
    imageClass: "object-center",
    theme: "dark",
  },
  {
    id: "essentials-edit",
    image: "https://res.cloudinary.com/yvegjlxd/image/upload/v1794387471/BN5.jpg",
    imageClass: "object-center",
    theme: "dark",
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
  eyebrow: "URBAN EDIT · GIN BOUTIQUE",
  title: "Effortless Motion.",
  subtitle: "Tối giản trong từng đường nét, tự do trong mọi chuyển động hằng ngày.",
  ctaLabel: "EXPLORE COLLECTION",
  ctaTo: "/products",
  image: "https://res.cloudinary.com/yvegjlxd/image/upload/v1794387471/BN6.jpg",
};

export const BRAND_STORY_BANNER = {
  eyebrow: "Our Philosophy",
  title: "SIMPLICITY IS THE ULTIMATE SOPHISTICATION.",
  image: "https://res.cloudinary.com/yvegjlxd/image/upload/v1794552890/f1.jpg",
};
