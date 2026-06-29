import { LogOut, ShieldOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { env_config } from "@/config/env";
import { app_routes } from "@/config/routes";
import { format_date } from "@/lib/format";
import { Badge, Button, Card, EmptyState, Skeleton } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuthStore } from "@/features/auth/store/auth-store";

import { useBlocks } from "../hooks/use-profile";

export function SettingsPage() {
  const navigate = useNavigate();
  const sign_out = useAuthStore((state) => state.sign_out);
  const blocks = useBlocks();

  function handle_sign_out(): void {
    sign_out();
    navigate(app_routes.login, { replace: true });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title="Настройки" description="Управление аккаунтом" />

      {env_config.use_mocks ? (
        <Card className="border-amber-500/20 bg-amber-500/5 p-4 text-sm text-amber-200">
          Демо-режим включён: данные желаний, совпадений и профиля хранятся в
          памяти браузера. Отключите <code>VITE_USE_MOCKS</code>, чтобы
          использовать реальный backend.
        </Card>
      ) : null}

      <section>
        <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
          <ShieldOff className="h-4 w-4" />
          Заблокированные пользователи
        </h2>
        {blocks.isLoading ? (
          <Skeleton className="h-20" />
        ) : blocks.data && blocks.data.length > 0 ? (
          <div className="space-y-2">
            {blocks.data.map((block) => (
              <Card
                key={block.id}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <p className="text-sm font-medium text-white">
                    {block.blocked_name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {format_date(block.created_at)}
                  </p>
                </div>
                <Badge tone="warning">{block.reason}</Badge>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={ShieldOff}
            title="Список пуст"
            description="Вы пока никого не блокировали."
          />
        )}
      </section>

      <Button
        variant="danger"
        className="w-full"
        left_icon={<LogOut className="h-4 w-4" />}
        onClick={handle_sign_out}
      >
        Выйти из аккаунта
      </Button>
    </div>
  );
}
