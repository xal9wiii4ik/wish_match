import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, LogIn, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { app_routes } from "@/config/routes";
import { ApiError } from "@/lib/api-error";
import { Button, Field, Input, notify } from "@/components/ui";

import { useLogin } from "../hooks/use-auth-mutations";
import { login_schema, type LoginFormValues } from "../lib/schemas";
import { AuthLayout } from "../components/AuthLayout";

interface LocationState {
  from?: { pathname?: string };
}

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useLogin();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(login_schema),
    defaultValues: { email: "", password: "" },
  });

  const redirect_to =
    (location.state as LocationState | null)?.from?.pathname ??
    app_routes.discover;

  function on_submit(values: LoginFormValues): void {
    login.mutate(values, {
      onSuccess: () => {
        notify.success("С возвращением!");
        navigate(redirect_to, { replace: true });
      },
      onError: (error) => {
        if (error instanceof ApiError) {
          for (const [field, message] of Object.entries(error.field_errors)) {
            setError(field as keyof LoginFormValues, { message });
          }
          notify.error(error.message);
        }
      },
    });
  }

  return (
    <AuthLayout
      title="Вход в аккаунт"
      subtitle="Рады видеть вас снова в WishMatch"
      footer={
        <>
          Нет аккаунта?{" "}
          <Link
            to={app_routes.register}
            className="font-semibold text-brand-300 hover:text-brand-200"
          >
            Зарегистрироваться
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(on_submit)} className="space-y-5" noValidate>
        <Field label="Email" html_for="email" error={errors.email?.message} required>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            left_icon={<Mail className="h-4 w-4" />}
            has_error={Boolean(errors.email)}
            {...register("email")}
          />
        </Field>

        <Field
          label="Пароль"
          html_for="password"
          error={errors.password?.message}
          required
        >
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            left_icon={<Lock className="h-4 w-4" />}
            has_error={Boolean(errors.password)}
            {...register("password")}
          />
        </Field>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          is_loading={login.isPending}
          left_icon={<LogIn className="h-4 w-4" />}
        >
          Войти
        </Button>
      </form>
    </AuthLayout>
  );
}
