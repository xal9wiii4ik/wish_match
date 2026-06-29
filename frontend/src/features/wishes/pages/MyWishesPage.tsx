import { Pencil, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { app_routes, build_wish_detail_path } from "@/config/routes";
import {
  Badge,
  Button,
  EmptyState,
  Modal,
  Skeleton,
  notify,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import type { Wish, WishStatus } from "@/types";

import { WishCard } from "../components/WishCard";
import { useDeleteWish, useMyWishes } from "../hooks/use-wishes";

const status_labels: Record<WishStatus, { label: string; tone: "success" | "neutral" | "warning" }> = {
  active: { label: "Активно", tone: "success" },
  closed: { label: "Закрыто", tone: "neutral" },
  expired: { label: "Истекло", tone: "warning" },
};

export function MyWishesPage() {
  const navigate = useNavigate();
  const wishes = useMyWishes();
  const delete_wish = useDeleteWish();
  const [wish_to_delete, set_wish_to_delete] = useState<Wish | null>(null);

  function confirm_delete(): void {
    if (!wish_to_delete) {
      return;
    }
    delete_wish.mutate(wish_to_delete.id, {
      onSuccess: () => {
        notify.success("Желание удалено");
        set_wish_to_delete(null);
      },
      onError: () => notify.error("Не удалось удалить желание"),
    });
  }

  return (
    <div>
      <PageHeader
        title="Мои желания"
        description="Управляйте своими желаниями и откликами"
        action={
          <Button
            left_icon={<Plus className="h-4 w-4" />}
            onClick={() => navigate(app_routes.wish_create)}
          >
            Новое желание
          </Button>
        }
      />

      {wishes.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      ) : wishes.data && wishes.data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {wishes.data.map((wish) => {
            const status = status_labels[wish.status];
            return (
              <div key={wish.id} className="space-y-2">
                <Link to={build_wish_detail_path(wish.id)} className="block">
                  <WishCard wish={wish} compact />
                </Link>
                <div className="flex items-center justify-between px-1">
                  <Badge tone={status.tone}>{status.label}</Badge>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      left_icon={<Pencil className="h-4 w-4" />}
                      onClick={() =>
                        navigate(build_wish_detail_path(wish.id), {
                          state: { edit: true },
                        })
                      }
                    >
                      Изменить
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                      left_icon={<Trash2 className="h-4 w-4" />}
                      onClick={() => set_wish_to_delete(wish)}
                    >
                      Удалить
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          icon={Sparkles}
          title="У вас пока нет желаний"
          description="Создайте первое желание — и вас найдут единомышленники."
          action={
            <Button
              left_icon={<Plus className="h-4 w-4" />}
              onClick={() => navigate(app_routes.wish_create)}
            >
              Создать желание
            </Button>
          }
        />
      )}

      <Modal
        is_open={wish_to_delete !== null}
        on_close={() => set_wish_to_delete(null)}
        title="Удалить желание?"
      >
        <p className="text-sm text-slate-300">
          Желание «{wish_to_delete?.title}» будет удалено без возможности
          восстановления.
        </p>
        <div className="mt-6 flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => set_wish_to_delete(null)}
          >
            Отмена
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            is_loading={delete_wish.isPending}
            onClick={confirm_delete}
          >
            Удалить
          </Button>
        </div>
      </Modal>
    </div>
  );
}
