import { create } from "zustand";

import { token_storage } from "@/lib/token-storage";
import type { User } from "@/types";

import { profile_api } from "@/features/profile/api/profile-api";

export type AuthStatus =
  | "initializing"
  | "authenticated"
  | "unauthenticated";

interface AuthState {
  token: string | null;
  user: User | null;
  status: AuthStatus;
  initialize: () => Promise<void>;
  set_session: (token: string, user: User) => void;
  set_user: (user: User) => void;
  sign_out: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: token_storage.get(),
  user: null,
  status: "initializing",

  initialize: async () => {
    const token = token_storage.get();
    if (!token) {
      set({ status: "unauthenticated", token: null, user: null });
      return;
    }

    try {
      const user = await profile_api.get_current_user();
      set({ token, user, status: "authenticated" });
    } catch {
      token_storage.clear();
      set({ token: null, user: null, status: "unauthenticated" });
    }
  },

  set_session: (token, user) => {
    token_storage.set(token);
    set({ token, user, status: "authenticated" });
  },

  set_user: (user) => {
    if (get().status === "authenticated") {
      set({ user });
    }
  },

  sign_out: () => {
    token_storage.clear();
    set({ token: null, user: null, status: "unauthenticated" });
  },
}));
