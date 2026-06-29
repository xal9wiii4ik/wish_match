import type { InputHTMLAttributes, ReactNode, Ref } from "react";

import { cn } from "@/lib/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  left_icon?: ReactNode;
  has_error?: boolean;
  ref?: Ref<HTMLInputElement>;
}

export function Input({
  className,
  left_icon,
  has_error = false,
  ref,
  ...rest
}: InputProps) {
  return (
    <div className="relative">
      {left_icon ? (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {left_icon}
        </span>
      ) : null}
      <input
        ref={ref}
        className={cn(
          "focus-ring h-11 w-full rounded-xl border bg-surface-card/60 px-4 text-sm text-white placeholder:text-slate-500 transition-colors",
          left_icon && "pl-10",
          has_error
            ? "border-red-500/70 focus-visible:ring-red-500"
            : "border-white/10 hover:border-white/20",
          className
        )}
        {...rest}
      />
    </div>
  );
}
