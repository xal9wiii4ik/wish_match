import type { GeoPoint } from "./geo";

export type Gender = "male" | "female";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  location: GeoPoint | null;
  telegram: string | null;
  instagram: string | null;
  gender: Gender | null;
  created_at: string;
}

export interface ProfileUpdatePayload {
  name?: string;
  bio?: string | null;
  city?: string | null;
  avatar_url?: string | null;
  telegram?: string | null;
  instagram?: string | null;
  gender?: Gender | null;
  location?: GeoPoint | null;
}
