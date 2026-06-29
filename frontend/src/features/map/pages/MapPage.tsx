import { MapPin } from "lucide-react";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { env_config } from "@/config/env";
import { app_routes, build_wish_detail_path } from "@/config/routes";
import { Button, EmptyState, Skeleton } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useCategories } from "@/features/categories/hooks/use-categories";
import { CategoryFilter } from "@/features/wishes/components/CategoryFilter";
import { WishCard } from "@/features/wishes/components/WishCard";
import { useWishFeed } from "@/features/wishes/hooks/use-wishes";
import {
  build_category_map,
  compute_distance_km,
} from "@/features/wishes/lib/wish-view";
import type { Wish, WishFeedQuery } from "@/types";

import { WishMap } from "../components/WishMap";

const default_radius_km = 100;

export function MapPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const me_location = user?.location ?? null;
  const [category_id, set_category_id] = useState<string | null>(null);
  const [selected_wish, set_selected_wish] = useState<Wish | null>(null);

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

  const category_map = useMemo(
    () => build_category_map(categories_query.data ?? []),
    [categories_query.data]
  );

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
              category_map={category_map}
              me_location={me_location}
              on_select_wish={set_selected_wish}
              height="100%"
            />
          )}
        </div>

        <div className="space-y-4">
          {selected_wish ? (
            <>
              <WishCard
                wish={selected_wish}
                category={category_map.get(selected_wish.category_id)}
                distance_km={compute_distance_km(me_location, selected_wish)}
                compact
              />
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
