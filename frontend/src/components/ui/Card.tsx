import type { HTMLAttributes } from "react";

import { cn } from "@/lib/cn";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10 bg-surface-card/70 shadow-card",
        className
      )}
      {...rest}
    />
  );
}
