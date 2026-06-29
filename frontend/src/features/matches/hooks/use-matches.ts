import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { query_keys } from "@/lib/query-keys";

import { matches_api } from "../api/matches-api";

export function useMatches() {
  return useQuery({
    queryKey: query_keys.matches,
    queryFn: () => matches_api.list(),
  });
}

export function useMarkMatchSeen() {
  const query_client = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (match_id) => matches_api.mark_seen(match_id),
    onSuccess: () => {
      void query_client.invalidateQueries({ queryKey: query_keys.matches });
    },
  });
}
