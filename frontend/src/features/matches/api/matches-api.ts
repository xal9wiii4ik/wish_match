import { env_config } from "@/config/env";
import { http_client } from "@/lib/http-client";
import { mock_backend } from "@/mocks/mock-backend";
import type { Match } from "@/types";

export const matches_api = {
  async list(): Promise<Match[]> {
    if (env_config.use_mocks) {
      return mock_backend.list_matches();
    }
    const { data } = await http_client.get<Match[]>("/matches");
    return data;
  },

  async mark_seen(match_id: string): Promise<void> {
    if (env_config.use_mocks) {
      return mock_backend.mark_match_seen(match_id);
    }
    await http_client.post(`/matches/${match_id}/seen`);
  },
};
