import {
  BookOpen,
  Dumbbell,
  Mountain,
  PartyPopper,
  Plane,
  Sparkles,
  Theater,
  UtensilsCrossed,
  Wine,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface CategoryVisual {
  icon: LucideIcon;
  gradient: string;
}

const visuals_by_slug: Record<string, CategoryVisual> = {
  food: { icon: UtensilsCrossed, gradient: "from-amber-500 to-orange-600" },
  travel: { icon: Plane, gradient: "from-sky-500 to-blue-600" },
  sport: { icon: Dumbbell, gradient: "from-emerald-500 to-green-600" },
  entertainment: {
    icon: PartyPopper,
    gradient: "from-indigo-500 to-violet-600",
  },
  culture: { icon: Theater, gradient: "from-fuchsia-500 to-purple-600" },
  education: { icon: BookOpen, gradient: "from-cyan-500 to-teal-600" },
  outdoor: { icon: Mountain, gradient: "from-lime-500 to-emerald-600" },
  nightlife: { icon: Wine, gradient: "from-pink-500 to-rose-600" },
};

const fallback_visual: CategoryVisual = {
  icon: Sparkles,
  gradient: "from-brand-500 to-accent-500",
};

export function get_category_visual(slug: string | undefined): CategoryVisual {
  if (!slug) {
    return fallback_visual;
  }
  return visuals_by_slug[slug] ?? fallback_visual;
}
