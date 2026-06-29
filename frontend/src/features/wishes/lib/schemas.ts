import { z } from "zod";

export const wish_form_schema = z.object({
  title: z
    .string()
    .min(3, "Минимум 3 символа")
    .max(120, "Не длиннее 120 символов"),
  description: z.string().max(2000, "Слишком длинное описание").optional(),
  category_id: z.string().min(1, "Выберите категорию"),
  max_participants: z
    .number({ message: "Укажите число" })
    .int("Целое число")
    .min(1, "Минимум 1")
    .max(100, "Максимум 100"),
  expires_at: z.string().optional(),
  location_name: z.string().max(200).optional(),
  city: z.string().max(120).optional(),
});

export type WishFormValues = z.infer<typeof wish_form_schema>;
