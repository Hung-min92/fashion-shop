const COLOR_MAP = {
  den: "#171717",
  black: "#171717",
  trang: "#FFFFFF",
  white: "#FFFFFF",
  be: "#DFD5C6",
  beige: "#DFD5C6",
  kem: "#F3EFE6",
  cream: "#F3EFE6",
  xam: "#8A8A8A",
  grey: "#8A8A8A",
  gray: "#8A8A8A",
  nau: "#6E4F3A",
  brown: "#6E4F3A",
  "xanh navy": "#1F2A3C",
  navy: "#1F2A3C",
  "xanh duong": "#3B5998",
  blue: "#3B5998",
  "xanh reu": "#4A5844",
  olive: "#4A5844",
  "xanh la": "#2F5233",
  green: "#2F5233",
  do: "#8C2D2D",
  red: "#8C2D2D",
  hong: "#D8A7B1",
  pink: "#D8A7B1",
  vang: "#D4AF37",
  yellow: "#D4AF37",
  camel: "#B9A58A",
  tan: "#B9A58A",
};

function normalizeColor(name = "") {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .trim();
}

export function getColorHex(colorName) {
  const key = normalizeColor(colorName);
  return COLOR_MAP[key] || null;
}

