import { CalendarClock, MapPin, Users } from "lucide-react";

import { cn } from "@/lib/cn";
import { format_distance, format_relative_time } from "@/lib/format";
import { Avatar, Badge } from "@/components/ui";
import type { Wish } from "@/types";

import { get_category_visual } from "../lib/category-visuals";

interface WishCardProps {
  wish: Wish;
  className?: string;
  compact?: boolean;
}

export function WishCard({ wish, className, compact = false }: WishCardProps) {
  const visual = get_category_visual(wish.category.slug);
  const Icon = visual.icon;
  const distance_label = format_distance(wish.distance_km);

  return (
    <article
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-surface-card/80 shadow-card",
        className
      )}
    >
      <div
        className={cn(
          "relative bg-gradient-to-br p-5",
          visual.gradient,
          compact ? "h-24" : "h-32"
        )}
      >
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative flex items-start justify-between">
          <Badge tone="neutral" className="bg-black/30 text-white">
            <Icon className="h-3.5 w-3.5" />
            {wish.category.name}
          </Badge>
          {distance_label ? (
            <Badge tone="neutral" className="bg-black/30 text-white">
              <MapPin className="h-3.5 w-3.5" />
              {distance_label}
            </Badge>
          ) : null}
        </div>
        <Icon className="absolute -bottom-3 right-3 h-20 w-20 text-white/15" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="text-lg font-bold text-white">{wish.title}</h3>
          {wish.description ? (
            <p
              className={cn(
                "mt-1 text-sm text-slate-400",
                compact ? "line-clamp-2" : "line-clamp-4"
              )}
            >
              {wish.description}
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400">
          {wish.location.location_name ? (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {wish.location.location_name}
            </span>
          ) : null}
          <span className="inline-flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            до {wish.max_participants}
          </span>
          <span className="inline-flex items-center gap-1">
            <CalendarClock className="h-3.5 w-3.5" />
            {format_relative_time(wish.created_at)}
          </span>
        </div>

        <div className="flex items-center gap-2 border-t border-white/5 pt-3">
          <Avatar name={wish.owner.name} src={wish.owner.avatar_url} size="sm" />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">
              {wish.owner.name}
            </p>
            {wish.owner.city ? (
              <p className="truncate text-xs text-slate-500">
                {wish.owner.city}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
