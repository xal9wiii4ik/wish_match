import { useMutation } from "@tanstack/react-query";

import { profile_api } from "@/features/profile/api/profile-api";
import type { LoginPayload, MessageResponse, RegisterPayload } from "@/types";

import { auth_api } from "../api/auth-api";
import { useAuthStore } from "../store/auth-store";

export function useLogin() {
  const set_session = useAuthStore((state) => state.set_session);

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const token_response = await auth_api.login(payload);
      const user = await profile_api.get_current_user();
      return { token: token_response.access_token, user };
    },
    onSuccess: ({ token, user }) => {
      set_session(token, user);
    },
  });
}

export function useRegister() {
  return useMutation<MessageResponse, Error, RegisterPayload>({
    mutationFn: (payload) => auth_api.register(payload),
  });
}

export function useConfirmEmail() {
  return useMutation<MessageResponse, Error, string>({
    mutationFn: (token) => auth_api.confirm_email(token),
  });
}
