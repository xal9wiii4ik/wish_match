import type { GeoLocation } from "./geo";

export type WishStatus = "active" | "closed" | "expired";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Wish {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string | null;
  location: GeoLocation;
  status: WishStatus;
  max_participants: number;
  spots_left: number | null;
  expires_at: string | null;
  created_at: string;
}

export interface WishCreatePayload {
  title: string;
  description: string | null;
  category_id: string;
  location: GeoLocation;
  max_participants: number;
  expires_at: string | null;
}

export type WishUpdatePayload = Partial<WishCreatePayload> & {
  status?: "active" | "closed";
};

export interface WishFeedQuery {
  near: { latitude: number; longitude: number; radius_km: number };
  category_id?: string;
  limit?: number;
  offset?: number;
}
