export type BlockReason = "spam" | "harassment" | "inappropriate" | "other";

export interface BlockPayload {
  blocked_id: string;
  reason: BlockReason;
  description: string | null;
  screenshot_urls: string[];
}

export interface Block {
  id: string;
  blocked_id: string;
  blocked_name: string;
  reason: BlockReason;
  description: string | null;
  created_at: string;
}
