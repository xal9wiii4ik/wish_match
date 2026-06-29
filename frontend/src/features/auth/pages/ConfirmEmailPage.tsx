import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { app_routes } from "@/config/routes";
import { ApiError } from "@/lib/api-error";
import { Button, Spinner } from "@/components/ui";

import { useConfirmEmail } from "../hooks/use-auth-mutations";
import { AuthLayout } from "../components/AuthLayout";

export function ConfirmEmailPage() {
  const [search_params] = useSearchParams();
  const token = search_params.get("token");
  const confirm = useConfirmEmail();
  const has_started = useRef(false);

  useEffect(() => {
    if (has_started.current || !token) {
      return;
    }
    has_started.current = true;
    confirm.mutate(token);
  }, [confirm, token]);

  function render_body() {
    if (!token) {
      return (
        <Status
          tone="error"
          title="Ссылка недействительна"
          description="В ссылке отсутствует токен подтверждения."
        />
      );
    }

    if (confirm.isPending || confirm.isIdle) {
      return (
        <div className="flex flex-col items-center gap-4 py-6 text-slate-300">
          <Spinner className="h-7 w-7 text-brand-400" />
          <p>Подтверждаем ваш email…</p>
        </div>
      );
    }

    if (confirm.isError) {
      const message =
        confirm.error instanceof ApiError
          ? confirm.error.message
          : "Не удалось подтвердить email";
      return (
        <Status
          tone="error"
          title="Подтверждение не удалось"
          description={message}
        />
      );
    }

    return (
      <Status
        tone="success"
        title="Email подтверждён"
        description={confirm.data?.message ?? "Теперь вы можете войти."}
      />
    );
  }

  return (
    <AuthLayout
      title="Подтверждение почты"
      subtitle="Активация вашего аккаунта"
      footer={
        <Link
          to={app_routes.login}
          className="font-semibold text-brand-300 hover:text-brand-200"
        >
          Перейти ко входу
        </Link>
      }
    >
      {render_body()}
    </AuthLayout>
  );
}

interface StatusProps {
  tone: "success" | "error";
  title: string;
  description: string;
}

function Status({ tone, title, description }: StatusProps) {
  const Icon = tone === "success" ? CheckCircle2 : XCircle;
  const accent = tone === "success" ? "text-emerald-400" : "text-red-400";

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-white/10 bg-surface-card/60 p-8 text-center">
      <Icon className={`h-12 w-12 ${accent}`} />
      <div>
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="mt-1 text-sm text-slate-400">{description}</p>
      </div>
      {tone === "success" ? (
        <Link to={app_routes.login}>
          <Button>Войти в аккаунт</Button>
        </Link>
      ) : null}
    </div>
  );
}
