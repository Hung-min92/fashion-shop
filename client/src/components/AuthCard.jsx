export default function AuthCard({ eyebrow, title, intro, children }) {
    return (
        <div className="mx-auto max-w-md py-8 sm:py-14 animate-fade-in">
            <div className="border border-[#EAEAEA] bg-white p-8 sm:p-10">
                <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#777777]">
                    {eyebrow}
                </p>
                <h1 className="mt-2 font-serif text-3xl font-normal text-[#171717]">{title}</h1>
                {intro && <p className="mt-2 text-xs leading-relaxed text-[#777777]">{intro}</p>}
                <div className="mt-7">{children}</div>
            </div>
        </div>
    );
}