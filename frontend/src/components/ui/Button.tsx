import type { ButtonHTMLAttributes, ReactNode, Ref } from "react";

import { cn } from "@/lib/cn";

import { Spinner } from "./Spinner";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  is_loading?: boolean;
  left_icon?: ReactNode;
  right_icon?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

const variant_styles: Record<ButtonVariant, string> = {
  primary:
    "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-glow hover:from-brand-400 hover:to-brand-500",
  secondary: "bg-white/10 text-white hover:bg-white/15 border border-white/10",
  ghost: "bg-transparent text-slate-300 hover:bg-white/5 hover:text-white",
  danger: "bg-red-500/90 text-white hover:bg-red-500",
  outline:
    "border border-brand-400/50 text-brand-200 hover:bg-brand-500/10 hover:text-white",
};

const size_styles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  is_loading = false,
  left_icon,
  right_icon,
  className,
  children,
  disabled,
  ref,
  ...rest
}: ButtonProps) {
  const is_disabled = disabled || is_loading;

  return (
    <button
      ref={ref}
      disabled={is_disabled}
      className={cn(
        "focus-ring inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60",
        variant_styles[variant],
        size_styles[size],
        className
      )}
      {...rest}
    >
      {is_loading ? <Spinner className="h-4 w-4" /> : left_icon}
      {children}
      {!is_loading && right_icon}
    </button>
  );
}
