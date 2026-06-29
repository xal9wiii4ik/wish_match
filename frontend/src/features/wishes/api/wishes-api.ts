import { env_config } from "@/config/env";
import { http_client } from "@/lib/http-client";
import { mock_backend } from "@/mocks/mock-backend";
import type {
  Wish,
  WishCreatePayload,
  WishFeedQuery,
  WishUpdatePayload,
} from "@/types";

function build_feed_params(query: WishFeedQuery): Record<string, unknown> {
  const params: Record<string, unknown> = {};
  if (query.category_id) {
    params.category_id = query.category_id;
  }
  if (query.search) {
    params.search = query.search;
  }
  if (query.near) {
    params.latitude = query.near.latitude;
    params.longitude = query.near.longitude;
    params.radius_km = query.near.radius_km;
  }
  return params;
}

export const wishes_api = {
  async get_feed(query: WishFeedQuery): Promise<Wish[]> {
    if (env_config.use_mocks) {
      return mock_backend.get_wish_feed(query);
    }
    const { data } = await http_client.get<Wish[]>("/wishes/feed", {
      params: build_feed_params(query),
    });
    return data;
  },

  async get_mine(): Promise<Wish[]> {
    if (env_config.use_mocks) {
      return mock_backend.get_my_wishes();
    }
    const { data } = await http_client.get<Wish[]>("/wishes/mine");
    return data;
  },

  async get_one(wish_id: string): Promise<Wish> {
    if (env_config.use_mocks) {
      return mock_backend.get_wish(wish_id);
    }
    const { data } = await http_client.get<Wish>(`/wishes/${wish_id}`);
    return data;
  },

  async create(payload: WishCreatePayload): Promise<Wish> {
    if (env_config.use_mocks) {
      return mock_backend.create_wish(payload);
    }
    const { data } = await http_client.post<Wish>("/wishes", payload);
    return data;
  },

  async update(wish_id: string, payload: WishUpdatePayload): Promise<Wish> {
    if (env_config.use_mocks) {
      return mock_backend.update_wish(wish_id, payload);
    }
    const { data } = await http_client.patch<Wish>(
      `/wishes/${wish_id}`,
      payload
    );
    return data;
  },

  async remove(wish_id: string): Promise<void> {
    if (env_config.use_mocks) {
      return mock_backend.delete_wish(wish_id);
    }
    await http_client.delete(`/wishes/${wish_id}`);
  },
};
