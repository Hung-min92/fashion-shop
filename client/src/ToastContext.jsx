import { createContext, useCallback, useContext, useState } from "react";
import { CloseIcon, CheckIcon } from "./components/Icons.jsx";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, { type = "default", duration = 3200 } = {}) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      setToasts((prev) => [...prev, { id, message, type }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-5 right-5 z-50 flex w-full max-w-xs flex-col gap-2 px-4 sm:px-0"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 border px-4 py-3 text-xs tracking-wide shadow-sm animate-fade-in-up ${
              t.type === "error"
                ? "border-red-200 bg-white text-red-700"
                : "border-[#171717] bg-[#171717] text-white"
            }`}
          >
            <div className="flex items-center gap-2.5">
              {t.type !== "error" && <CheckIcon className="h-3.5 w-3.5 shrink-0 text-[#B9A58A]" />}
              <span className="leading-snug">{t.message}</span>
            </div>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Đóng thông báo"
              className="opacity-70 transition hover:opacity-100"
            >
              <CloseIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

