import { Link } from "react-router-dom";
import type { ReactNode } from "react";

import { app_routes } from "@/config/routes";
import { Logo } from "@/components/layout/Logo";

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}

const highlights = [
  "Находи людей с общими желаниями рядом",
  "Свайпай желания и собирай совпадения",
  "Смотри всё на интерактивной карте",
];

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 p-12 lg:flex">
        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-accent-500/30 blur-3xl" />

        <Link to={app_routes.landing} className="relative z-10">
          <Logo />
        </Link>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-extrabold leading-tight text-white">
            Превращай желания
            <br />в совместные истории
          </h1>
          <ul className="space-y-3">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-3 text-white/90">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-sm">
                  ✓
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-sm text-white/60">
          © {new Date().getFullYear()} WishMatch
        </p>
      </div>

      <div className="flex items-center justify-center bg-surface px-6 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h2 className="text-2xl font-bold text-white">{title}</h2>
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>

          <div className="mt-8">{children}</div>

          {footer ? (
            <div className="mt-6 text-center text-sm text-slate-400">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
