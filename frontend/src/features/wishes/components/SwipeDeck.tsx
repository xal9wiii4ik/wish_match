import {
  animate,
  motion,
  useMotionValue,
  useTransform,
  type PanInfo,
} from "framer-motion";
import { Heart, RotateCcw, X } from "lucide-react";
import {
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type Ref,
} from "react";

import { Button } from "@/components/ui";
import type { Category, GeoPoint, Wish } from "@/types";

import { compute_distance_km } from "../lib/wish-view";
import { WishCard } from "./WishCard";

export type SwipeDirection = "left" | "right";

interface SwipeDeckProps {
  wishes: Wish[];
  category_map: Map<string, Category>;
  me_location?: GeoPoint | null;
  on_swipe: (wish: Wish, is_like: boolean) => void;
  on_restart?: () => void;
}

interface SwipeableCardHandle {
  trigger: (direction: SwipeDirection) => void;
}

const fly_threshold = 120;

export function SwipeDeck({
  wishes,
  category_map,
  me_location,
  on_swipe,
  on_restart,
}: SwipeDeckProps) {
  const top_card_ref = useRef<SwipeableCardHandle>(null);

  const ids_key = useMemo(
    () => wishes.map((wish) => wish.id).join(","),
    [wishes]
  );

  const [index, set_index] = useState(0);
  const [tracked_key, set_tracked_key] = useState(ids_key);

  // Reset the deck when the underlying feed changes (recommended pattern for
  // deriving state from props without an effect).
  if (ids_key !== tracked_key) {
    set_tracked_key(ids_key);
    set_index(0);
  }

  const visible = wishes.slice(index, index + 3);
  const is_empty = index >= wishes.length;

  function handle_complete(wish: Wish, direction: SwipeDirection): void {
    on_swipe(wish, direction === "right");
    set_index((previous) => previous + 1);
  }

  if (is_empty) {
    return (
      <div className="flex h-[28rem] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-white/10 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-3xl">
          🎉
        </span>
        <div>
          <h3 className="text-lg font-semibold text-white">
            Желания закончились
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Загляните позже или измените фильтры.
          </p>
        </div>
        {on_restart ? (
          <Button
            variant="secondary"
            left_icon={<RotateCcw className="h-4 w-4" />}
            onClick={on_restart}
          >
            Обновить ленту
          </Button>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative h-[28rem] w-full max-w-md">
        {visible
          .map((wish, position) => ({ wish, position }))
          .reverse()
          .map(({ wish, position }) => (
            <SwipeableCard
              key={wish.id}
              ref={position === 0 ? top_card_ref : undefined}
              wish={wish}
              category={category_map.get(wish.category_id)}
              distance_km={compute_distance_km(me_location, wish)}
              stack_position={position}
              is_interactive={position === 0}
              on_complete={(direction) => handle_complete(wish, direction)}
            />
          ))}
      </div>

      <div className="flex items-center gap-5">
        <button
          type="button"
          aria-label="Пропустить"
          onClick={() => top_card_ref.current?.trigger("left")}
          className="focus-ring flex h-16 w-16 items-center justify-center rounded-full border border-white/10 bg-surface-card text-red-400 transition-transform hover:scale-105 hover:border-red-400/40"
        >
          <X className="h-7 w-7" />
        </button>
        <button
          type="button"
          aria-label="Нравится"
          onClick={() => top_card_ref.current?.trigger("right")}
          className="focus-ring flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow transition-transform hover:scale-105"
        >
          <Heart className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
}

interface SwipeableCardProps {
  wish: Wish;
  category?: Category;
  distance_km: number | null;
  stack_position: number;
  is_interactive: boolean;
  on_complete: (direction: SwipeDirection) => void;
  ref?: Ref<SwipeableCardHandle>;
}

function SwipeableCard({
  wish,
  category,
  distance_km,
  stack_position,
  is_interactive,
  on_complete,
  ref,
}: SwipeableCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-300, 0, 300], [-18, 0, 18]);
  const like_opacity = useTransform(x, [40, 160], [0, 1]);
  const nope_opacity = useTransform(x, [-160, -40], [1, 0]);

  function fly(direction: SwipeDirection): void {
    const target = direction === "right" ? 700 : -700;
    void animate(x, target, {
      duration: 0.35,
      ease: "easeOut",
      onComplete: () => on_complete(direction),
    });
  }

  useImperativeHandle(ref, () => ({ trigger: fly }));

  function handle_drag_end(_event: unknown, info: PanInfo): void {
    if (info.offset.x > fly_threshold) {
      fly("right");
    } else if (info.offset.x < -fly_threshold) {
      fly("left");
    } else {
      void animate(x, 0, { type: "spring", stiffness: 320, damping: 26 });
    }
  }

  const scale = 1 - stack_position * 0.04;
  const translate_y = stack_position * 14;

  return (
    <motion.div
      className="absolute inset-0"
      style={is_interactive ? { x, rotate } : undefined}
      animate={{ scale, y: translate_y }}
      transition={{ type: "spring", stiffness: 260, damping: 24 }}
      drag={is_interactive ? "x" : false}
      dragSnapToOrigin={false}
      dragElastic={0.6}
      onDragEnd={is_interactive ? handle_drag_end : undefined}
    >
      <div className="relative h-full">
        <WishCard
          wish={wish}
          category={category}
          distance_km={distance_km}
          className="h-full"
        />
        {is_interactive ? (
          <>
            <motion.span
              style={{ opacity: like_opacity }}
              className="absolute left-5 top-5 rotate-[-12deg] rounded-lg border-2 border-emerald-400 px-3 py-1 text-lg font-extrabold uppercase text-emerald-400"
            >
              Нравится
            </motion.span>
            <motion.span
              style={{ opacity: nope_opacity }}
              className="absolute right-5 top-5 rotate-[12deg] rounded-lg border-2 border-red-400 px-3 py-1 text-lg font-extrabold uppercase text-red-400"
            >
              Мимо
            </motion.span>
          </>
        ) : null}
      </div>
    </motion.div>
  );
}
