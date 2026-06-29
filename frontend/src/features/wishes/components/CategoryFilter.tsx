import { cn } from "@/lib/cn";
import type { Category } from "@/types";

import { get_category_visual } from "../lib/category-visuals";

interface CategoryFilterProps {
  categories: Category[];
  selected_id: string | null;
  on_select: (category_id: string | null) => void;
}

export function CategoryFilter({
  categories,
  selected_id,
  on_select,
}: CategoryFilterProps) {
  return (
    <div className="scrollbar-thin flex gap-2 overflow-x-auto pb-1">
      <FilterChip
        label="Все"
        is_active={selected_id === null}
        on_click={() => on_select(null)}
      />
      {categories.map((category) => {
        const Icon = get_category_visual(category.slug).icon;
        return (
          <FilterChip
            key={category.id}
            label={category.name}
            is_active={selected_id === category.id}
            on_click={() => on_select(category.id)}
            icon={<Icon className="h-3.5 w-3.5" />}
          />
        );
      })}
    </div>
  );
}

interface FilterChipProps {
  label: string;
  is_active: boolean;
  on_click: () => void;
  icon?: React.ReactNode;
}

function FilterChip({ label, is_active, on_click, icon }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={on_click}
      className={cn(
        "focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
        is_active
          ? "border-brand-400/40 bg-brand-500/20 text-white"
          : "border-white/10 bg-white/5 text-slate-400 hover:text-white"
      )}
    >
      {icon}
      {label}
    </button>
  );
}
