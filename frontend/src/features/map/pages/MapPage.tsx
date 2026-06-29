import { MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { app_routes, build_wish_detail_path } from "@/config/routes";
import { Button, EmptyState, Skeleton } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { CategoryFilter } from "@/features/wishes/components/CategoryFilter";
import { WishCard } from "@/features/wishes/components/WishCard";
import { useWishFeed } from "@/features/wishes/hooks/use-wishes";
import type { Wish, WishFeedQuery } from "@/types";

import { WishMap } from "../components/WishMap";

export function MapPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [category_id, set_category_id] = useState<string | null>(null);
  const [selected_wish, set_selected_wish] = useState<Wish | null>(null);

  const feed_query = useMemo<WishFeedQuery>(
    () => (category_id ? { category_id } : {}),
    [category_id]
  );

  const categories_query = useCategories();
  const feed = useWishFeed(feed_query);

  return (
    <div>
      <PageHeader
        title="Карта желаний"
        description="Смотрите, что происходит рядом с вами"
      />

      {categories_query.data ? (
        <div className="mb-4">
          <CategoryFilter
            categories={categories_query.data}
            selected_id={category_id}
            on_select={set_category_id}
          />
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="h-[60vh] min-h-[24rem] overflow-hidden rounded-2xl border border-white/10">
          {feed.isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <WishMap
              wishes={feed.data ?? []}
              me_location={user?.location ?? null}
              on_select_wish={set_selected_wish}
              height="100%"
            />
          )}
        </div>

        <div className="space-y-4">
          {selected_wish ? (
            <>
              <WishCard wish={selected_wish} compact />
              <Button
                className="w-full"
                onClick={() =>
                  navigate(build_wish_detail_path(selected_wish.id))
                }
              >
                Открыть желание
              </Button>
            </>
          ) : (
            <EmptyState
              icon={MapPin}
              title="Выберите метку"
              description="Нажмите на точку на карте, чтобы увидеть детали желания."
              action={
                <Button
                  variant="secondary"
                  onClick={() => navigate(app_routes.discover)}
                >
                  Перейти в ленту
                </Button>
              }
            />
          )}
        </div>
      </div>
    </div>
  );
}
