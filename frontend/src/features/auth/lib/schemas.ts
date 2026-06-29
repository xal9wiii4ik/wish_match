import { z } from "zod";

export const login_schema = z.object({
  email: z.string().min(1, "Введите email").email("Некорректный email"),
  password: z.string().min(1, "Введите пароль"),
});

export const register_schema = z.object({
  name: z
    .string()
    .min(1, "Введите имя")
    .max(100, "Имя не длиннее 100 символов"),
  email: z.string().min(1, "Введите email").email("Некорректный email"),
  password: z.string().min(8, "Минимум 8 символов"),
});

export type LoginFormValues = z.infer<typeof login_schema>;
export type RegisterFormValues = z.infer<typeof register_schema>;
