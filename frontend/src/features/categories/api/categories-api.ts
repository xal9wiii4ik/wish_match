import { env_config } from "@/config/env";
import { map_category, type CategoryDto } from "@/lib/dto";
import { http_client } from "@/lib/http-client";
import { mock_backend } from "@/mocks/mock-backend";
import type { Category } from "@/types";

export const categories_api = {
  async list(): Promise<Category[]> {
    if (env_config.use_mocks) {
      return mock_backend.list_categories();
    }
    const { data } = await http_client.get<CategoryDto[]>("/categories");
    return data.map(map_category);
  },
};
