import { env_config } from "@/config/env";
import {
  map_wish,
  to_location_dto,
  type ListDto,
  type WishDto,
} from "@/lib/dto";
import { http_client } from "@/lib/http-client";
import { mock_backend } from "@/mocks/mock-backend";
import type {
  Wish,
  WishCreatePayload,
  WishFeedQuery,
  WishUpdatePayload,
} from "@/types";

function build_feed_params(query: WishFeedQuery): Record<string, unknown> {
  const params: Record<string, unknown> = {
    lat: query.near.latitude,
    lon: query.near.longitude,
    radius_km: query.near.radius_km,
    limit: query.limit ?? 50,
    offset: query.offset ?? 0,
  };
  if (query.category_id) {
    params.category_id = query.category_id;
  }
  return params;
}

function build_wish_body(
  payload: WishCreatePayload | WishUpdatePayload
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (payload.title !== undefined) body.title = payload.title;
  if (payload.description !== undefined) body.description = payload.description;
  if (payload.category_id !== undefined) body.category_id = payload.category_id;
  if (payload.max_participants !== undefined) {
    body.max_participants = payload.max_participants;
  }
  if (payload.expires_at !== undefined) body.expires_at = payload.expires_at;
  if (payload.location !== undefined) {
    body.location = to_location_dto(payload.location);
    body.location_name = payload.location.location_name;
    body.city = payload.location.city;
  }
  if ("status" in payload && payload.status !== undefined) {
    body.status = payload.status;
  }
  return body;
}

export const wishes_api = {
  async get_feed(query: WishFeedQuery): Promise<Wish[]> {
    if (env_config.use_mocks) {
      return mock_backend.get_wish_feed(query);
    }
    const { data } = await http_client.get<ListDto<WishDto>>("/wishes/feed", {
      params: build_feed_params(query),
    });
    return data.items.map(map_wish);
  },

  async get_mine(): Promise<Wish[]> {
    if (env_config.use_mocks) {
      return mock_backend.get_my_wishes();
    }
    const { data } = await http_client.get<ListDto<WishDto>>("/wishes/my");
    return data.items.map(map_wish);
  },

  async get_one(wish_id: string): Promise<Wish> {
    if (env_config.use_mocks) {
      return mock_backend.get_wish(wish_id);
    }
    const { data } = await http_client.get<WishDto>(`/wishes/${wish_id}`);
    return map_wish(data);
  },

  async create(payload: WishCreatePayload): Promise<Wish> {
    if (env_config.use_mocks) {
      return mock_backend.create_wish(payload);
    }
    const { data } = await http_client.post<WishDto>(
      "/wishes",
      build_wish_body(payload)
    );
    return map_wish(data);
  },

  async update(wish_id: string, payload: WishUpdatePayload): Promise<Wish> {
    if (env_config.use_mocks) {
      return mock_backend.update_wish(wish_id, payload);
    }
    const { data } = await http_client.patch<WishDto>(
      `/wishes/${wish_id}`,
      build_wish_body(payload)
    );
    return map_wish(data);
  },

  async remove(wish_id: string): Promise<void> {
    if (env_config.use_mocks) {
      return mock_backend.delete_wish(wish_id);
    }
    await http_client.delete(`/wishes/${wish_id}`);
  },
};
