import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail, UserPlus, User as UserIcon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";

import { app_routes } from "@/config/routes";
import { ApiError } from "@/lib/api-error";
import { Button, Field, Input, notify } from "@/components/ui";

import { useRegister } from "../hooks/use-auth-mutations";
import { register_schema, type RegisterFormValues } from "../lib/schemas";
import { AuthLayout } from "../components/AuthLayout";

export function RegisterPage() {
  const register_mutation = useRegister();
  const [submitted_email, set_submitted_email] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(register_schema),
    defaultValues: { name: "", email: "", password: "" },
  });

  function on_submit(values: RegisterFormValues): void {
    register_mutation.mutate(values, {
      onSuccess: (response) => {
        set_submitted_email(values.email);
        notify.success(response.message);
      },
      onError: (error) => {
        if (error instanceof ApiError) {
          for (const [field, message] of Object.entries(error.field_errors)) {
            setError(field as keyof RegisterFormValues, { message });
          }
          notify.error(error.message);
        }
      },
    });
  }

  if (submitted_email) {
    return (
      <AuthLayout
        title="Подтвердите почту"
        subtitle="Остался последний шаг"
        footer={
          <Link
            to={app_routes.login}
            className="font-semibold text-brand-300 hover:text-brand-200"
          >
            Вернуться ко входу
          </Link>
        }
      >
        <div className="rounded-2xl border border-white/10 bg-surface-card/60 p-6 text-sm text-slate-300">
          Мы отправили письмо со ссылкой подтверждения на{" "}
          <span className="font-semibold text-white">{submitted_email}</span>.
          Откройте письмо и перейдите по ссылке, чтобы активировать аккаунт.
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Создать аккаунт"
      subtitle="Присоединяйтесь к сообществу WishMatch"
      footer={
        <>
          Уже есть аккаунт?{" "}
          <Link
            to={app_routes.login}
            className="font-semibold text-brand-300 hover:text-brand-200"
          >
            Войти
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(on_submit)} className="space-y-5" noValidate>
        <Field label="Имя" html_for="name" error={errors.name?.message} required>
          <Input
            id="name"
            autoComplete="name"
            placeholder="Как вас зовут?"
            left_icon={<UserIcon className="h-4 w-4" />}
            has_error={Boolean(errors.name)}
            {...register("name")}
          />
        </Field>

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
          hint="Минимум 8 символов"
          required
        >
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
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
          is_loading={register_mutation.isPending}
          left_icon={<UserPlus className="h-4 w-4" />}
        >
          Зарегистрироваться
        </Button>
      </form>
    </AuthLayout>
  );
}
