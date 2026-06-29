import { env_config } from "@/config/env";
import { http_client } from "@/lib/http-client";
import { mock_backend } from "@/mocks/mock-backend";
import type { Category } from "@/types";

export const categories_api = {
  async list(): Promise<Category[]> {
    if (env_config.use_mocks) {
      return mock_backend.list_categories();
    }
    const { data } = await http_client.get<Category[]>("/categories");
    return data;
  },
};
