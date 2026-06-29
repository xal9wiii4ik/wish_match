import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

type BadgeTone = "brand" | "accent" | "neutral" | "success" | "warning";

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

const tone_styles: Record<BadgeTone, string> = {
  brand: "bg-brand-500/15 text-brand-200 border-brand-400/30",
  accent: "bg-accent-500/15 text-accent-400 border-accent-500/30",
  neutral: "bg-white/5 text-slate-300 border-white/10",
  success: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  warning: "bg-amber-500/15 text-amber-300 border-amber-500/30",
};

export function Badge({ children, tone = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tone_styles[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
