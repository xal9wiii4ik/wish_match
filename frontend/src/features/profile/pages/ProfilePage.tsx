import {
  CalendarDays,
  Camera,
  MapPin,
  Pencil,
  Send,
  Settings,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { app_routes } from "@/config/routes";
import { format_date } from "@/lib/format";
import { Avatar, Badge, Button, Card, notify } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuthStore } from "@/features/auth/store/auth-store";
import type { ProfileUpdatePayload } from "@/types";

import { ProfileForm } from "../components/ProfileForm";
import { useUpdateProfile } from "../hooks/use-profile";

export function ProfilePage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const update_profile = useUpdateProfile();
  const [is_editing, set_is_editing] = useState(false);

  if (!user) {
    return null;
  }

  function handle_submit(payload: ProfileUpdatePayload): void {
    update_profile.mutate(payload, {
      onSuccess: () => {
        notify.success("Профиль обновлён");
        set_is_editing(false);
      },
      onError: () => notify.error("Не удалось обновить профиль"),
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="Профиль"
        action={
          <Button
            variant="ghost"
            size="sm"
            left_icon={<Settings className="h-4 w-4" />}
            onClick={() => navigate(app_routes.settings)}
          >
            Настройки
          </Button>
        }
      />

      {is_editing ? (
        <ProfileForm
          user={user}
          is_submitting={update_profile.isPending}
          on_submit={handle_submit}
          on_cancel={() => set_is_editing(false)}
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-brand-600 to-accent-600" />
          <div className="px-6 pb-6">
            <div className="-mt-12 flex items-end justify-between">
              <Avatar
                name={user.name}
                src={user.avatar_url}
                size="lg"
                className="ring-4 ring-surface-card"
              />
              <Button
                variant="secondary"
                size="sm"
                left_icon={<Pencil className="h-4 w-4" />}
                onClick={() => set_is_editing(true)}
              >
                Редактировать
              </Button>
            </div>

            <h2 className="mt-4 text-xl font-bold text-white">{user.name}</h2>
            <p className="text-sm text-slate-400">{user.email}</p>

            {user.bio ? (
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                {user.bio}
              </p>
            ) : (
              <p className="mt-4 text-sm italic text-slate-500">
                Расскажите о себе, чтобы вас лучше узнали.
              </p>
            )}

            <div className="mt-5 flex flex-wrap gap-2">
              {user.city ? (
                <Badge tone="neutral">
                  <MapPin className="h-3.5 w-3.5" />
                  {user.city}
                </Badge>
              ) : null}
              {user.telegram ? (
                <Badge tone="brand">
                  <Send className="h-3.5 w-3.5" />
                  {user.telegram}
                </Badge>
              ) : null}
              {user.instagram ? (
                <Badge tone="accent">
                  <Camera className="h-3.5 w-3.5" />
                  {user.instagram}
                </Badge>
              ) : null}
              <Badge tone="neutral">
                <CalendarDays className="h-3.5 w-3.5" />
                С нами с {format_date(user.created_at)}
              </Badge>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
