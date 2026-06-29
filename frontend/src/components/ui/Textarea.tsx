import type { TextareaHTMLAttributes, Ref } from "react";

import { cn } from "@/lib/cn";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  has_error?: boolean;
  ref?: Ref<HTMLTextAreaElement>;
}

export function Textarea({
  className,
  has_error = false,
  ref,
  ...rest
}: TextareaProps) {
  return (
    <textarea
      ref={ref}
      className={cn(
        "focus-ring min-h-24 w-full resize-y rounded-xl border bg-surface-card/60 px-4 py-3 text-sm text-white placeholder:text-slate-500 transition-colors",
        has_error
          ? "border-red-500/70 focus-visible:ring-red-500"
          : "border-white/10 hover:border-white/20",
        className
      )}
      {...rest}
    />
  );
}
