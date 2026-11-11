export default function Stars({ value = 0, size = "text-base" }) {
    const filled = Math.round(value);
    return (
        <span className={`${size} tracking-tight`} aria-label={`${value} trên 5 sao`}>
            <span className="text-black">{"★".repeat(filled)}</span>
            <span className="text-gray-300">{"★".repeat(5 - filled)}</span>
        </span>
    );
}