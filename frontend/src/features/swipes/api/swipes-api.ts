import { env_config } from "@/config/env";
import type { SwipeDto } from "@/lib/dto";
import { http_client } from "@/lib/http-client";
import { mock_backend } from "@/mocks/mock-backend";
import type { SwipePayload, SwipeResult } from "@/types";

export const swipes_api = {
  async create(payload: SwipePayload): Promise<SwipeResult> {
    if (env_config.use_mocks) {
      return mock_backend.swipe(payload);
    }
    const { data } = await http_client.post<SwipeDto>("/swipes", payload);
    return { is_match: data.match_id !== null, match_id: data.match_id };
  },
};
