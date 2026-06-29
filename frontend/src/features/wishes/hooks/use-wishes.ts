import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { query_keys } from "@/lib/query-keys";
import type {
  Wish,
  WishCreatePayload,
  WishFeedQuery,
  WishUpdatePayload,
} from "@/types";

import { wishes_api } from "../api/wishes-api";

export function useWishFeed(query: WishFeedQuery) {
  return useQuery({
    queryKey: query_keys.wish_feed(query),
    queryFn: () => wishes_api.get_feed(query),
  });
}

export function useMyWishes() {
  return useQuery({
    queryKey: query_keys.my_wishes,
    queryFn: () => wishes_api.get_mine(),
  });
}

export function useWish(wish_id: string | undefined) {
  return useQuery({
    queryKey: query_keys.wish_detail(wish_id ?? "unknown"),
    queryFn: () => wishes_api.get_one(wish_id as string),
    enabled: Boolean(wish_id),
  });
}

export function useCreateWish() {
  const query_client = useQueryClient();
  return useMutation<Wish, Error, WishCreatePayload>({
    mutationFn: (payload) => wishes_api.create(payload),
    onSuccess: () => {
      void query_client.invalidateQueries({ queryKey: query_keys.my_wishes });
    },
  });
}

export function useUpdateWish(wish_id: string) {
  const query_client = useQueryClient();
  return useMutation<Wish, Error, WishUpdatePayload>({
    mutationFn: (payload) => wishes_api.update(wish_id, payload),
    onSuccess: (updated) => {
      void query_client.invalidateQueries({ queryKey: query_keys.my_wishes });
      query_client.setQueryData(query_keys.wish_detail(wish_id), updated);
    },
  });
}

export function useDeleteWish() {
  const query_client = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (wish_id) => wishes_api.remove(wish_id),
    onSuccess: () => {
      void query_client.invalidateQueries({ queryKey: query_keys.my_wishes });
    },
  });
}
