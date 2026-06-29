import { PartyPopper } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { env_config } from "@/config/env";
import { app_routes } from "@/config/routes";
import {
  Button,
  EmptyState,
  Modal,
  Skeleton,
  notify,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { useSwipe } from "@/features/swipes/hooks/use-swipe";
import type { Wish, WishFeedQuery } from "@/types";

import { CategoryFilter } from "../components/CategoryFilter";
import { SwipeDeck } from "../components/SwipeDeck";
import { useWishFeed } from "../hooks/use-wishes";
import { build_category_map } from "../lib/wish-view";

const default_radius_km = 100;

export function DiscoverPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [category_id, set_category_id] = useState<string | null>(null);
  const [matched_wish, set_matched_wish] = useState<Wish | null>(null);

  const me_location = user?.location ?? null;

  const feed_query = useMemo<WishFeedQuery>(() => {
    const center = me_location ?? {
      latitude: env_config.default_map_center.lat,
      longitude: env_config.default_map_center.lng,
    };
    return {
      near: {
        latitude: center.latitude,
        longitude: center.longitude,
        radius_km: default_radius_km,
      },
      ...(category_id ? { category_id } : {}),
    };
  }, [category_id, me_location]);

  const categories_query = useCategories();
  const feed = useWishFeed(feed_query);
  const swipe = useSwipe();

  const category_map = useMemo(
    () => build_category_map(categories_query.data ?? []),
    [categories_query.data]
  );

  function handle_swipe(wish: Wish, is_like: boolean): void {
    swipe.mutate(
      { wish_id: wish.id, is_like },
      {
        onSuccess: (result) => {
          if (result.is_match) {
            set_matched_wish(wish);
          }
        },
        onError: () => {
          notify.error("Не удалось сохранить свайп");
        },
      }
    );
  }

  return (
    <div>
      <PageHeader
        title="Лента желаний"
        description="Свайпайте вправо, если хотите присоединиться"
      />

      {categories_query.data ? (
        <div className="mb-6">
          <CategoryFilter
            categories={categories_query.data}
            selected_id={category_id}
            on_select={set_category_id}
          />
        </div>
      ) : null}

      {feed.isLoading ? (
        <div className="mx-auto h-[28rem] w-full max-w-md">
          <Skeleton className="h-full w-full" />
        </div>
      ) : feed.isError ? (
        <EmptyState
          icon={PartyPopper}
          title="Не удалось загрузить ленту"
          description="Проверьте подключение и попробуйте снова."
          action={<Button onClick={() => feed.refetch()}>Повторить</Button>}
        />
      ) : feed.data && feed.data.length > 0 ? (
        <SwipeDeck
          wishes={feed.data}
          category_map={category_map}
          me_location={me_location}
          on_swipe={handle_swipe}
          on_restart={() => feed.refetch()}
        />
      ) : (
        <EmptyState
          icon={PartyPopper}
          title="Пока нет желаний рядом"
          description="Создайте своё желание, чтобы вас нашли единомышленники."
          action={
            <Button onClick={() => navigate(app_routes.wish_create)}>
              Создать желание
            </Button>
          }
        />
      )}

      <Modal
        is_open={matched_wish !== null}
        on_close={() => set_matched_wish(null)}
        title="Это совпадение!"
      >
        {matched_wish ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <PartyPopper className="h-12 w-12 text-accent-400" />
            <p className="text-slate-300">
              Вы откликнулись на «
              <span className="font-semibold text-white">
                {matched_wish.title}
              </span>
              ». Найдите детали в разделе «Совпадения».
            </p>
            <div className="flex w-full gap-3">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => set_matched_wish(null)}
              >
                Продолжить
              </Button>
              <Button
                className="flex-1"
                onClick={() => navigate(app_routes.matches)}
              >
                К совпадениям
              </Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
