import { z } from "zod";

export const profile_schema = z.object({
  name: z.string().min(1, "Введите имя").max(100, "Не длиннее 100 символов"),
  bio: z.string().max(500, "Не длиннее 500 символов").optional(),
  city: z.string().max(120).optional(),
  telegram: z.string().max(64).optional(),
  instagram: z.string().max(64).optional(),
  avatar_url: z
    .string()
    .url("Некорректная ссылка")
    .optional()
    .or(z.literal("")),
});

export type ProfileFormValues = z.infer<typeof profile_schema>;
