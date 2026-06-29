import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

interface FieldProps {
  label: string;
  html_for?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export function Field({
  label,
  html_for,
  error,
  hint,
  required = false,
  children,
  className,
}: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label
        htmlFor={html_for}
        className="text-sm font-medium text-slate-300"
      >
        {label}
        {required ? <span className="ml-1 text-accent-400">*</span> : null}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-red-400">{error}</p>
      ) : hint ? (
        <p className="text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}
