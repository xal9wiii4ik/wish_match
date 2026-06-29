import { useMutation, useQueryClient } from "@tanstack/react-query";

import { query_keys } from "@/lib/query-keys";
import type { SwipePayload, SwipeResult } from "@/types";

import { swipes_api } from "../api/swipes-api";

export function useSwipe() {
  const query_client = useQueryClient();
  return useMutation<SwipeResult, Error, SwipePayload>({
    mutationFn: (payload) => swipes_api.create(payload),
    onSuccess: (result) => {
      if (result.is_match) {
        void query_client.invalidateQueries({ queryKey: query_keys.matches });
      }
    },
  });
}
