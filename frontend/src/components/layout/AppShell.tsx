import { LogOut, Plus } from "lucide-react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

import { app_routes } from "@/config/routes";
import { cn } from "@/lib/cn";
import { Avatar, Button } from "@/components/ui";

import { useAuthStore } from "@/features/auth/store/auth-store";

import { Logo } from "./Logo";
import { primary_nav_items } from "./nav-items";

function nav_link_class({ isActive }: { isActive: boolean }): string {
  return cn(
    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
    isActive
      ? "bg-brand-500/15 text-white"
      : "text-slate-400 hover:bg-white/5 hover:text-white"
  );
}

function mobile_link_class({ isActive }: { isActive: boolean }): string {
  return cn(
    "flex flex-1 flex-col items-center gap-1 py-2 text-xs font-medium transition-colors",
    isActive ? "text-brand-300" : "text-slate-500 hover:text-slate-300"
  );
}

export function AppShell() {
  const user = useAuthStore((state) => state.user);
  const sign_out = useAuthStore((state) => state.sign_out);
  const navigate = useNavigate();

  function handle_sign_out(): void {
    sign_out();
    navigate(app_routes.login, { replace: true });
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-white/10 bg-surface-card/40 p-4 lg:flex">
        <NavLink to={app_routes.discover} className="px-2 py-3">
          <Logo />
        </NavLink>

        <nav className="mt-6 flex flex-1 flex-col gap-1">
          {primary_nav_items.map((item) => (
            <NavLink key={item.to} to={item.to} className={nav_link_class}>
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <Button
          variant="primary"
          className="w-full"
          left_icon={<Plus className="h-4 w-4" />}
          onClick={() => navigate(app_routes.wish_create)}
        >
          Новое желание
        </Button>

        {user ? (
          <div className="mt-4 flex items-center gap-3 rounded-xl border border-white/10 p-3">
            <Avatar name={user.name} src={user.avatar_url} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">
                {user.name}
              </p>
              <p className="truncate text-xs text-slate-500">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={handle_sign_out}
              className="focus-ring rounded-lg p-1.5 text-slate-400 hover:bg-white/5 hover:text-white"
              aria-label="Выйти"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        ) : null}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-white/10 bg-surface/80 px-4 py-3 backdrop-blur-xl lg:hidden">
          <Logo />
          <button
            type="button"
            onClick={handle_sign_out}
            className="focus-ring rounded-lg p-2 text-slate-400 hover:text-white"
            aria-label="Выйти"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-24 pt-6 lg:pb-10">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 flex border-t border-white/10 bg-surface/90 backdrop-blur-xl lg:hidden">
        {primary_nav_items.map((item) => (
          <NavLink key={item.to} to={item.to} className={mobile_link_class}>
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
