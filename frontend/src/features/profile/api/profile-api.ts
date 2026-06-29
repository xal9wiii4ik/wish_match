import { env_config } from "@/config/env";
import {
  map_profile,
  to_location_dto,
  type ProfileDto,
} from "@/lib/dto";
import { http_client } from "@/lib/http-client";
import { mock_backend } from "@/mocks/mock-backend";
import type { Block, BlockPayload, ProfileUpdatePayload, User } from "@/types";

function build_profile_body(
  payload: ProfileUpdatePayload
): Record<string, unknown> {
  const body: Record<string, unknown> = {};
  if (payload.name !== undefined) body.name = payload.name;
  if (payload.bio !== undefined) body.bio = payload.bio;
  if (payload.city !== undefined) body.city = payload.city;
  if (payload.telegram !== undefined) body.telegram = payload.telegram;
  if (payload.instagram !== undefined) body.instagram = payload.instagram;
  if (payload.avatar_url !== undefined) body.avatar_url = payload.avatar_url;
  if (payload.gender !== undefined) body.gender = payload.gender;
  if (payload.location !== undefined) {
    body.location = payload.location
      ? to_location_dto(payload.location)
      : null;
  }
  return body;
}

export const profile_api = {
  async get_current_user(): Promise<User> {
    if (env_config.use_mocks) {
      return mock_backend.get_current_user();
    }
    const { data } = await http_client.get<ProfileDto>("/users/me");
    return map_profile(data);
  },

  async update_profile(payload: ProfileUpdatePayload): Promise<User> {
    if (env_config.use_mocks) {
      return mock_backend.update_profile(payload);
    }
    const { data } = await http_client.patch<ProfileDto>(
      "/users/me",
      build_profile_body(payload)
    );
    return map_profile(data);
  },

  // The backend does not expose a blocks endpoint yet; keep the UI functional.
  async list_blocks(): Promise<Block[]> {
    if (env_config.use_mocks) {
      return mock_backend.list_blocks();
    }
    return [];
  },

  async create_block(payload: BlockPayload): Promise<Block> {
    if (env_config.use_mocks) {
      return mock_backend.create_block(payload);
    }
    const { data } = await http_client.post<Block>("/blocks", payload);
    return data;
  },
};
