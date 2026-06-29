import { Sparkles } from "lucide-react";

import { cn } from "@/lib/cn";

interface LogoProps {
  className?: string;
  show_text?: boolean;
}

export function Logo({ className, show_text = true }: LogoProps) {
  return (
    <span className={cn("flex items-center gap-2", className)}>
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow">
        <Sparkles className="h-5 w-5" />
      </span>
      {show_text ? (
        <span className="text-lg font-extrabold tracking-tight">
          Wish<span className="gradient-text">Match</span>
        </span>
      ) : null}
    </span>
  );
}
