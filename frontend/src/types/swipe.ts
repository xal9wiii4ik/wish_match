import type { Wish } from "./wish";

export interface SwipePayload {
  wish_id: string;
  is_like: boolean;
}

export interface SwipeResult {
  is_match: boolean;
  match_id: string | null;
}

export interface MatchPartner {
  id: string;
  name: string | null;
  avatar_url: string | null;
  telegram: string | null;
  instagram: string | null;
}

export interface Match {
  id: string;
  wish: Wish;
  partner_id: string;
  partner: MatchPartner | null;
  is_seen: boolean;
  created_at: string;
}
