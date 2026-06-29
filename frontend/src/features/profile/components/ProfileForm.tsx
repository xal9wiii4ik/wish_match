import { zodResolver } from "@hookform/resolvers/zod";
import { AtSign, Camera, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button, Field, Input, Textarea } from "@/components/ui";
import { LocationPicker } from "@/features/map/components/LocationPicker";
import type { GeoPoint, ProfileUpdatePayload, User } from "@/types";

import { profile_schema, type ProfileFormValues } from "../lib/schemas";

interface ProfileFormProps {
  user: User;
  is_submitting: boolean;
  on_submit: (payload: ProfileUpdatePayload) => void;
  on_cancel: () => void;
}

function normalize_optional(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function ProfileForm({
  user,
  is_submitting,
  on_submit,
  on_cancel,
}: ProfileFormProps) {
  const [location, set_location] = useState<GeoPoint | null>(user.location);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profile_schema),
    defaultValues: {
      name: user.name,
      bio: user.bio ?? "",
      city: user.city ?? "",
      telegram: user.telegram ?? "",
      instagram: user.instagram ?? "",
      avatar_url: user.avatar_url ?? "",
    },
  });

  function submit_handler(values: ProfileFormValues): void {
    on_submit({
      name: values.name,
      bio: normalize_optional(values.bio),
      city: normalize_optional(values.city),
      telegram: normalize_optional(values.telegram),
      instagram: normalize_optional(values.instagram),
      avatar_url: normalize_optional(values.avatar_url),
      location,
    });
  }

  return (
    <form onSubmit={handleSubmit(submit_handler)} className="space-y-5" noValidate>
      <Field label="Имя" html_for="name" error={errors.name?.message} required>
        <Input id="name" has_error={Boolean(errors.name)} {...register("name")} />
      </Field>

      <Field label="О себе" html_for="bio" error={errors.bio?.message}>
        <Textarea
          id="bio"
          rows={3}
          placeholder="Несколько слов о вас и ваших интересах"
          {...register("bio")}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Город" html_for="city" error={errors.city?.message}>
          <Input
            id="city"
            placeholder="Москва"
            left_icon={<MapPin className="h-4 w-4" />}
            {...register("city")}
          />
        </Field>

        <Field
          label="Ссылка на аватар"
          html_for="avatar_url"
          error={errors.avatar_url?.message}
        >
          <Input
            id="avatar_url"
            placeholder="https://…"
            {...register("avatar_url")}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Telegram" html_for="telegram" error={errors.telegram?.message}>
          <Input
            id="telegram"
            placeholder="@username"
            left_icon={<Send className="h-4 w-4" />}
            {...register("telegram")}
          />
        </Field>

        <Field
          label="Instagram"
          html_for="instagram"
          error={errors.instagram?.message}
        >
          <Input
            id="instagram"
            placeholder="username"
            left_icon={<Camera className="h-4 w-4" />}
            {...register("instagram")}
          />
        </Field>
      </div>

      <Field label="Ваше местоположение" hint="Используется для расчёта расстояния">
        <LocationPicker value={location} on_change={set_location} height="260px" />
      </Field>

      <div className="flex gap-3">
        <Button
          type="button"
          variant="secondary"
          className="flex-1"
          onClick={on_cancel}
        >
          Отмена
        </Button>
        <Button
          type="submit"
          className="flex-1"
          is_loading={is_submitting}
          left_icon={<AtSign className="h-4 w-4" />}
        >
          Сохранить
        </Button>
      </div>
    </form>
  );
}
