import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { app_routes, build_wish_detail_path } from "@/config/routes";
import { Button, Skeleton, notify } from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import { useCategories } from "@/features/categories/hooks/use-categories";
import type { WishCreatePayload } from "@/types";

import { WishForm } from "../components/WishForm";
import { useCreateWish } from "../hooks/use-wishes";

export function WishCreatePage() {
  const navigate = useNavigate();
  const categories = useCategories();
  const create_wish = useCreateWish();

  function handle_submit(payload: WishCreatePayload): void {
    create_wish.mutate(payload, {
      onSuccess: (wish) => {
        notify.success("Желание опубликовано");
        navigate(build_wish_detail_path(wish.id));
      },
      onError: () => notify.error("Не удалось создать желание"),
    });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Button
        variant="ghost"
        size="sm"
        className="mb-2"
        left_icon={<ArrowLeft className="h-4 w-4" />}
        onClick={() => navigate(app_routes.my_wishes)}
      >
        Назад
      </Button>

      <PageHeader
        title="Новое желание"
        description="Опишите, что хотите осуществить вместе с кем-то"
      />

      {categories.isLoading ? (
        <Skeleton className="h-96" />
      ) : categories.data ? (
        <WishForm
          categories={categories.data}
          submit_label="Опубликовать"
          is_submitting={create_wish.isPending}
          on_submit={handle_submit}
        />
      ) : null}
    </div>
  );
}
