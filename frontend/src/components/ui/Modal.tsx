import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  is_open: boolean;
  title?: string;
  on_close: () => void;
  children: ReactNode;
}

export function Modal({ is_open, title, on_close, children }: ModalProps) {
  useEffect(() => {
    function handle_key(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        on_close();
      }
    }
    if (is_open) {
      document.addEventListener("keydown", handle_key);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handle_key);
      document.body.style.overflow = "";
    };
  }, [is_open, on_close]);

  return createPortal(
    <AnimatePresence>
      {is_open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={on_close}
            aria-hidden
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            className="glass-panel relative z-10 w-full max-w-lg rounded-2xl bg-surface-card/95 p-6 shadow-card"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mb-4 flex items-center justify-between">
              {title ? (
                <h2 className="text-lg font-semibold text-white">{title}</h2>
              ) : (
                <span />
              )}
              <button
                type="button"
                onClick={on_close}
                className="focus-ring rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body
  );
}
