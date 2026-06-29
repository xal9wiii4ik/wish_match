import { ChevronDown } from "lucide-react";
import type { SelectHTMLAttributes, Ref } from "react";

import { cn } from "@/lib/cn";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  has_error?: boolean;
  ref?: Ref<HTMLSelectElement>;
}

export function Select({
  options,
  placeholder,
  has_error = false,
  className,
  ref,
  ...rest
}: SelectProps) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "focus-ring h-11 w-full appearance-none rounded-xl border bg-surface-card/60 px-4 pr-10 text-sm text-white transition-colors",
          has_error
            ? "border-red-500/70 focus-visible:ring-red-500"
            : "border-white/10 hover:border-white/20",
          className
        )}
        {...rest}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
    </div>
  );
}
