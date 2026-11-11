export default function Stars({ value = 0, size = "text-xs" }) {
  const filled = Math.round(value);
  return (
    <span
      className={`inline-flex items-center gap-0.5 tracking-tight ${size}`}
      aria-label={`${value} trên 5 sao`}
    >
      <span className="text-[#171717]">{"★".repeat(filled)}</span>
      <span className="text-[#EAEAEA]">{"★".repeat(Math.max(0, 5 - filled))}</span>
    </span>
  );
}
