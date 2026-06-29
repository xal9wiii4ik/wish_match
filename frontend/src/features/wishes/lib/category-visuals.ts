import {
  BookOpen,
  Dumbbell,
  Gamepad2,
  HeartHandshake,
  Music,
  Palette,
  Plane,
  UtensilsCrossed,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CategoryVisual {
  icon: LucideIcon;
  gradient: string;
}

const visuals_by_slug: Record<string, CategoryVisual> = {
  travel: { icon: Plane, gradient: "from-sky-500 to-blue-600" },
  sport: { icon: Dumbbell, gradient: "from-emerald-500 to-green-600" },
  music: { icon: Music, gradient: "from-fuchsia-500 to-purple-600" },
  food: { icon: UtensilsCrossed, gradient: "from-amber-500 to-orange-600" },
  education: { icon: BookOpen, gradient: "from-cyan-500 to-teal-600" },
  art: { icon: Palette, gradient: "from-pink-500 to-rose-600" },
  games: { icon: Gamepad2, gradient: "from-indigo-500 to-violet-600" },
  volunteering: {
    icon: HeartHandshake,
    gradient: "from-red-500 to-accent-600",
  },
};

const fallback_visual: CategoryVisual = {
  icon: Sparkles,
  gradient: "from-brand-500 to-accent-500",
};

export function get_category_visual(slug: string): CategoryVisual {
  return visuals_by_slug[slug] ?? fallback_visual;
}
