import type { Wish } from "./wish";

export interface SwipePayload {
  wish_id: string;
  is_like: boolean;
}

export interface SwipeResult {
  swipe_id: string;
  is_match: boolean;
  match_id: string | null;
}

export interface Match {
  id: string;
  wish: Wish;
  partner: {
    id: string;
    name: string;
    avatar_url: string | null;
    telegram: string | null;
    instagram: string | null;
  };
  is_seen: boolean;
  created_at: string;
}
