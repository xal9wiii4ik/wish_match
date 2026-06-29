import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/cn";

import { useToastStore, type ToastTone } from "./toast-store";

const tone_config: Record<ToastTone, { icon: LucideIcon; accent: string }> = {
  success: { icon: CheckCircle2, accent: "text-emerald-400" },
  error: { icon: XCircle, accent: "text-red-400" },
  info: { icon: Info, accent: "text-brand-300" },
};

export function Toaster() {
  const toasts = useToastStore((state) => state.toasts);
  const dismiss = useToastStore((state) => state.dismiss);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((toast) => {
          const { icon: Icon, accent } = tone_config[toast.tone];
          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="glass-panel pointer-events-auto flex w-full max-w-md items-center gap-3 rounded-xl bg-surface-card/95 px-4 py-3 shadow-card"
            >
              <Icon className={cn("h-5 w-5 shrink-0", accent)} />
              <p className="flex-1 text-sm text-slate-100">{toast.message}</p>
              <button
                type="button"
                onClick={() => dismiss(toast.id)}
                className="focus-ring rounded-md p-1 text-slate-400 hover:text-white"
                aria-label="Закрыть уведомление"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
