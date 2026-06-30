import type {
  Category,
  GeoLocation,
  GeoPoint,
  Match,
  User,
  Wish,
  WishStatus,
} from "@/types";

export interface LocationPointDto {
  lat: number;
  lon: number;
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
}

export interface ProfileDto {
  id: string;
  email: string;
  name: string;
  bio: string | null;
  city: string | null;
  telegram: string | null;
  instagram: string | null;
  avatar_url: string | null;
  gender: "male" | "female" | null;
  location: LocationPointDto | null;
  created_at: string;
}

export interface WishDto {
  id: string;
  user_id: string;
  category_id: string;
  title: string;
  description: string | null;
  location: LocationPointDto;
  location_name: string | null;
  city: string | null;
  status: string;
  max_participants: number;
  spots_left: number | null;
  expires_at: string | null;
  created_at: string;
}

export interface MatchDto {
  id: string;
  wish_id: string;
  wish: WishDto;
  user1_id: string;
  user2_id: string;
  partner_id: string;
  is_seen: boolean;
  created_at: string;
}

export interface SwipeDto {
  id: string;
  user_id: string;
  wish_id: string;
  is_like: boolean;
  match_id: string | null;
  created_at: string;
}

export interface ListDto<TItem> {
  items: TItem[];
  total: number;
}

export function to_location_dto(point: GeoPoint): LocationPointDto {
  return { lat: point.latitude, lon: point.longitude };
}

export function map_category(dto: CategoryDto): Category {
  return { id: dto.id, name: dto.name, slug: dto.slug };
}

export function map_profile(dto: ProfileDto): User {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.name,
    bio: dto.bio,
    city: dto.city,
    telegram: dto.telegram,
    instagram: dto.instagram,
    avatar_url: dto.avatar_url,
    gender: dto.gender,
    location: dto.location
      ? { latitude: dto.location.lat, longitude: dto.location.lon }
      : null,
    created_at: dto.created_at,
  };
}

export function map_wish(dto: WishDto): Wish {
  const location: GeoLocation = {
    latitude: dto.location.lat,
    longitude: dto.location.lon,
    location_name: dto.location_name,
    city: dto.city,
  };
  return {
    id: dto.id,
    user_id: dto.user_id,
    category_id: dto.category_id,
    title: dto.title,
    description: dto.description,
    location,
    status: dto.status as WishStatus,
    max_participants: dto.max_participants,
    spots_left: dto.spots_left,
    expires_at: dto.expires_at,
    created_at: dto.created_at,
  };
}

export function map_match(dto: MatchDto): Match {
  return {
    id: dto.id,
    wish: map_wish(dto.wish),
    partner_id: dto.partner_id,
    partner: null,
    is_seen: dto.is_seen,
    created_at: dto.created_at,
  };
}
