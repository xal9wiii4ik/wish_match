import { Link } from "react-router-dom";

import { app_routes } from "@/config/routes";
import { Button } from "@/components/ui";
import { Logo } from "@/components/layout/Logo";

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-surface px-6 text-center">
      <Logo />
      <div>
        <p className="text-6xl font-extrabold gradient-text">404</p>
        <h1 className="mt-2 text-xl font-semibold text-white">
          Страница не найдена
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          Возможно, ссылка устарела или была удалена.
        </p>
      </div>
      <Link to={app_routes.discover}>
        <Button>На главную</Button>
      </Link>
    </div>
  );
}
