import { Compass, Heart, Map, Sparkles, User } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { app_routes } from "@/config/routes";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export const primary_nav_items: NavItem[] = [
  { to: app_routes.discover, label: "Лента", icon: Compass },
  { to: app_routes.map, label: "Карта", icon: Map },
  { to: app_routes.matches, label: "Совпадения", icon: Heart },
  { to: app_routes.my_wishes, label: "Мои желания", icon: Sparkles },
  { to: app_routes.profile, label: "Профиль", icon: User },
];
