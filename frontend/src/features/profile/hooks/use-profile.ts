import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { query_keys } from "@/lib/query-keys";
import type { Block, BlockPayload, ProfileUpdatePayload, User } from "@/types";

import { useAuthStore } from "@/features/auth/store/auth-store";

import { profile_api } from "../api/profile-api";

export function useUpdateProfile() {
  const query_client = useQueryClient();
  const set_user = useAuthStore((state) => state.set_user);

  return useMutation<User, Error, ProfileUpdatePayload>({
    mutationFn: (payload) => profile_api.update_profile(payload),
    onSuccess: (user) => {
      set_user(user);
      query_client.setQueryData(query_keys.current_user, user);
    },
  });
}

export function useBlocks() {
  return useQuery({
    queryKey: query_keys.blocks,
    queryFn: () => profile_api.list_blocks(),
  });
}

export function useCreateBlock() {
  const query_client = useQueryClient();
  return useMutation<Block, Error, BlockPayload>({
    mutationFn: (payload) => profile_api.create_block(payload),
    onSuccess: () => {
      void query_client.invalidateQueries({ queryKey: query_keys.blocks });
    },
  });
}
