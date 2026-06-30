import { z } from "zod";

const telegram_pattern = /^@?[a-zA-Z0-9_]{4,32}$/;
const instagram_pattern = /^@?[a-zA-Z][a-zA-Z0-9._]{0,29}$/;

export const profile_schema = z
  .object({
    name: z.string().min(1, "Введите имя").max(100, "Не длиннее 100 символов"),
    bio: z.string().max(500, "Не длиннее 500 символов").optional(),
    city: z.string().max(120).optional(),
    telegram: z.string().max(64).optional(),
    instagram: z.string().max(64).optional(),
    gender: z.enum(["male", "female"]).optional().or(z.literal("")),
    avatar_url: z.string().url("Некорректная ссылка").optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    const telegram = data.telegram?.trim();
    const instagram = data.instagram?.trim();

    if (!telegram && !instagram) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["telegram"],
        message: "Укажите Telegram или Instagram для связи",
      });
    }
    if (telegram && !telegram_pattern.test(telegram)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["telegram"],
        message: "4–32 символа: буквы, цифры и _",
      });
    }
    if (instagram && !instagram_pattern.test(instagram)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["instagram"],
        message: "Некорректный Instagram",
      });
    }
  });

export type ProfileFormValues = z.infer<typeof profile_schema>;
