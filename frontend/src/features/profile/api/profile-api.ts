import { env_config } from "@/config/env";
import { http_client } from "@/lib/http-client";
import { mock_backend } from "@/mocks/mock-backend";
import type { Block, BlockPayload, ProfileUpdatePayload, User } from "@/types";

export const profile_api = {
  async get_current_user(): Promise<User> {
    if (env_config.use_mocks) {
      return mock_backend.get_current_user();
    }
    const { data } = await http_client.get<User>("/users/me");
    return data;
  },

  async update_profile(payload: ProfileUpdatePayload): Promise<User> {
    if (env_config.use_mocks) {
      return mock_backend.update_profile(payload);
    }
    const { data } = await http_client.patch<User>("/users/me", payload);
    return data;
  },

  async list_blocks(): Promise<Block[]> {
    if (env_config.use_mocks) {
      return mock_backend.list_blocks();
    }
    const { data } = await http_client.get<Block[]>("/blocks");
    return data;
  },

  async create_block(payload: BlockPayload): Promise<Block> {
    if (env_config.use_mocks) {
      return mock_backend.create_block(payload);
    }
    const { data } = await http_client.post<Block>("/blocks", payload);
    return data;
  },
};
