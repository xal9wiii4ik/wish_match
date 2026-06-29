import type { GeoLocation } from "./geo";
import type { User } from "./user";

export type WishStatus = "active" | "closed" | "expired";

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface WishOwner {
  id: string;
  name: string;
  avatar_url: string | null;
  city: string | null;
}

export interface Wish {
  id: string;
  title: string;
  description: string | null;
  category: Category;
  owner: WishOwner;
  location: GeoLocation;
  status: WishStatus;
  max_participants: number;
  expires_at: string | null;
  created_at: string;
  distance_km: number | null;
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
  status?: WishStatus;
};

export interface WishFeedQuery {
  category_id?: string;
  search?: string;
  near?: { latitude: number; longitude: number; radius_km: number };
}

export type { User };
