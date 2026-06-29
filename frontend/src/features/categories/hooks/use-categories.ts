import { useQuery } from "@tanstack/react-query";

import { query_keys } from "@/lib/query-keys";

import { categories_api } from "../api/categories-api";

export function useCategories() {
  return useQuery({
    queryKey: query_keys.categories,
    queryFn: () => categories_api.list(),
    staleTime: 5 * 60_000,
  });
}
