import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { is_valid_coordinate } from "@/lib/geo";
import {
  Button,
  Field,
  Input,
  Select,
  Textarea,
  type SelectOption,
} from "@/components/ui";
import { LocationPicker } from "@/features/map/components/LocationPicker";
import type { Category, GeoPoint, Wish, WishCreatePayload } from "@/types";

import { wish_form_schema, type WishFormValues } from "../lib/schemas";

interface WishFormProps {
  categories: Category[];
  initial_wish?: Wish;
  submit_label: string;
  is_submitting: boolean;
  on_submit: (payload: WishCreatePayload) => void;
}

function to_date_input_value(iso_date: string | null): string {
  if (!iso_date) {
    return "";
  }
  return iso_date.slice(0, 10);
}

export function WishForm({
  categories,
  initial_wish,
  submit_label,
  is_submitting,
  on_submit,
}: WishFormProps) {
  const [location, set_location] = useState<GeoPoint | null>(
    initial_wish
      ? {
          latitude: initial_wish.location.latitude,
          longitude: initial_wish.location.longitude,
        }
      : null
  );
  const [location_error, set_location_error] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WishFormValues>({
    resolver: zodResolver(wish_form_schema),
    defaultValues: {
      title: initial_wish?.title ?? "",
      description: initial_wish?.description ?? "",
      category_id: initial_wish?.category_id ?? "",
      max_participants: initial_wish?.max_participants ?? 1,
      expires_at: to_date_input_value(initial_wish?.expires_at ?? null),
      location_name: initial_wish?.location.location_name ?? "",
      city: initial_wish?.location.city ?? "",
    },
  });

  const category_options: SelectOption[] = categories.map((category) => ({
    value: category.id,
    label: category.name,
  }));

  function submit_handler(values: WishFormValues): void {
    if (!location || !is_valid_coordinate(location)) {
      set_location_error("Выберите точку на карте");
      return;
    }
    set_location_error(null);

    const payload: WishCreatePayload = {
      title: values.title,
      description: values.description?.trim() ? values.description.trim() : null,
      category_id: values.category_id,
      max_participants: values.max_participants,
      expires_at: values.expires_at
        ? new Date(values.expires_at).toISOString()
        : null,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        location_name: values.location_name?.trim()
          ? values.location_name.trim()
          : null,
        city: values.city?.trim() ? values.city.trim() : null,
      },
    };
    on_submit(payload);
  }

  return (
    <form onSubmit={handleSubmit(submit_handler)} className="space-y-5" noValidate>
      <Field label="Название" html_for="title" error={errors.title?.message} required>
        <Input
          id="title"
          placeholder="Например: Партнёр для утренних пробежек"
          has_error={Boolean(errors.title)}
          {...register("title")}
        />
      </Field>

      <Field
        label="Описание"
        html_for="description"
        error={errors.description?.message}
        hint="Расскажите подробнее, кого и для чего вы ищете"
      >
        <Textarea
          id="description"
          rows={4}
          placeholder="Опишите ваше желание…"
          has_error={Boolean(errors.description)}
          {...register("description")}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Категория"
          html_for="category_id"
          error={errors.category_id?.message}
          required
        >
          <Select
            id="category_id"
            placeholder="Выберите категорию"
            options={category_options}
            has_error={Boolean(errors.category_id)}
            {...register("category_id")}
          />
        </Field>

        <Field
          label="Максимум участников"
          html_for="max_participants"
          error={errors.max_participants?.message}
          required
        >
          <Input
            id="max_participants"
            type="number"
            min={1}
            max={100}
            has_error={Boolean(errors.max_participants)}
            {...register("max_participants", { valueAsNumber: true })}
          />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Город" html_for="city" error={errors.city?.message}>
          <Input id="city" placeholder="Москва" {...register("city")} />
        </Field>

        <Field
          label="Действует до"
          html_for="expires_at"
          error={errors.expires_at?.message}
          hint="Необязательно"
        >
          <Input id="expires_at" type="date" {...register("expires_at")} />
        </Field>
      </div>

      <Field
        label="Название места"
        html_for="location_name"
        error={errors.location_name?.message}
        hint="Например: Парк Горького"
      >
        <Input
          id="location_name"
          placeholder="Где встречаемся?"
          {...register("location_name")}
        />
      </Field>

      <Field label="Точка на карте" error={location_error ?? undefined} required>
        <LocationPicker value={location} on_change={set_location} />
      </Field>

      <Button type="submit" size="lg" className="w-full" is_loading={is_submitting}>
        {submit_label}
      </Button>
    </form>
  );
}
