import type { WishFeedQuery } from "@/types";

export const query_keys = {
  current_user: ["current_user"] as const,
  categories: ["categories"] as const,
  wish_feed: (query: WishFeedQuery) => ["wishes", "feed", query] as const,
  my_wishes: ["wishes", "mine"] as const,
  wish_detail: (wish_id: string) => ["wishes", "detail", wish_id] as const,
  matches: ["matches"] as const,
  blocks: ["blocks"] as const,
};
