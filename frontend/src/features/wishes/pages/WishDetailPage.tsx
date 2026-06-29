import { ArrowLeft, Heart, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";

import { app_routes } from "@/config/routes";
import { format_date } from "@/lib/format";
import {
  Badge,
  Button,
  EmptyState,
  Modal,
  Skeleton,
  notify,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { WishMap } from "@/features/map/components/WishMap";
import { useSwipe } from "@/features/swipes/hooks/use-swipe";
import type { WishCreatePayload } from "@/types";

import { WishCard } from "../components/WishCard";
import { WishForm } from "../components/WishForm";
import {
  useDeleteWish,
  useUpdateWish,
  useWish,
} from "../hooks/use-wishes";

interface DetailLocationState {
  edit?: boolean;
}

export function WishDetailPage() {
  const { wish_id } = useParams<{ wish_id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const current_user = useAuthStore((state) => state.user);

  const wish_query = useWish(wish_id);
  const categories = useCategories();
  const update_wish = useUpdateWish(wish_id ?? "");
  const delete_wish = useDeleteWish();
  const swipe = useSwipe();

  const [is_editing, set_is_editing] = useState(
    Boolean((location.state as DetailLocationState | null)?.edit)
  );
  const [show_delete, set_show_delete] = useState(false);

  if (wish_query.isLoading) {
    return <Skeleton className="h-96" />;
  }

  if (wish_query.isError || !wish_query.data) {
    return (
      <EmptyState
        icon={Heart}
        title="Желание не найдено"
        description="Возможно, оно было удалено или ссылка устарела."
        action={
          <Button onClick={() => navigate(app_routes.discover)}>
            В ленту
          </Button>
        }
      />
    );
  }

  const wish = wish_query.data;
  const is_owner = current_user?.id === wish.owner.id;

  function handle_update(payload: WishCreatePayload): void {
    update_wish.mutate(payload, {
      onSuccess: () => {
        notify.success("Желание обновлено");
        set_is_editing(false);
      },
      onError: () => notify.error("Не удалось обновить желание"),
    });
  }

  function handle_delete(): void {
    delete_wish.mutate(wish.id, {
      onSuccess: () => {
        notify.success("Желание удалено");
        navigate(app_routes.my_wishes);
      },
      onError: () => notify.error("Не удалось удалить желание"),
    });
  }

  function handle_respond(): void {
    swipe.mutate(
      { wish_id: wish.id, is_like: true },
      {
        onSuccess: (result) => {
          notify.success(
            result.is_match ? "Это совпадение!" : "Отклик отправлен"
          );
        },
        onError: () => notify.error("Не удалось отправить отклик"),
      }
    );
  }

  if (is_editing && categories.data) {
    return (
      <div className="mx-auto max-w-2xl">
        <Button
          variant="ghost"
          size="sm"
          className="mb-2"
          left_icon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => set_is_editing(false)}
        >
          Отмена
        </Button>
        <PageHeader title="Редактирование желания" />
        <WishForm
          categories={categories.data}
          initial_wish={wish}
          submit_label="Сохранить"
          is_submitting={update_wish.isPending}
          on_submit={handle_update}
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Button
        variant="ghost"
        size="sm"
        className="mb-2"
        left_icon={<ArrowLeft className="h-4 w-4" />}
        onClick={() => navigate(-1)}
      >
        Назад
      </Button>

      <div className="grid gap-6 lg:grid-cols-2">
        <WishCard wish={wish} />

        <div className="space-y-4">
          <div className="h-56 overflow-hidden rounded-2xl border border-white/10">
            <WishMap
              wishes={[wish]}
              me_location={current_user?.location ?? null}
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-surface-card/60 p-4 text-sm text-slate-300">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Создано</span>
              <span>{format_date(wish.created_at)}</span>
            </div>
            {wish.expires_at ? (
              <div className="mt-2 flex items-center justify-between">
                <span className="text-slate-500">Действует до</span>
                <span>{format_date(wish.expires_at)}</span>
              </div>
            ) : null}
            <div className="mt-2 flex items-center justify-between">
              <span className="text-slate-500">Категория</span>
              <Badge tone="brand">{wish.category.name}</Badge>
            </div>
          </div>

          {is_owner ? (
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                left_icon={<Pencil className="h-4 w-4" />}
                onClick={() => set_is_editing(true)}
              >
                Изменить
              </Button>
              <Button
                variant="danger"
                className="flex-1"
                left_icon={<Trash2 className="h-4 w-4" />}
                onClick={() => set_show_delete(true)}
              >
                Удалить
              </Button>
            </div>
          ) : (
            <Button
              className="w-full"
              size="lg"
              is_loading={swipe.isPending}
              left_icon={<Heart className="h-4 w-4" />}
              onClick={handle_respond}
            >
              Хочу участвовать
            </Button>
          )}
        </div>
      </div>

      <Modal
        is_open={show_delete}
        on_close={() => set_show_delete(false)}
        title="Удалить желание?"
      >
        <p className="text-sm text-slate-300">
          Желание «{wish.title}» будет удалено без возможности восстановления.
        </p>
        <div className="mt-6 flex gap-3">
          <Button
            variant="secondary"
            className="flex-1"
            onClick={() => set_show_delete(false)}
          >
            Отмена
          </Button>
          <Button
            variant="danger"
            className="flex-1"
            is_loading={delete_wish.isPending}
            onClick={handle_delete}
          >
            Удалить
          </Button>
        </div>
      </Modal>
    </div>
  );
}
