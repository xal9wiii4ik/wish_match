import { Camera, Send } from "lucide-react";

import { format_relative_time } from "@/lib/format";
import { Avatar, Badge } from "@/components/ui";
import type { Match } from "@/types";

interface MatchCardProps {
  match: Match;
  on_open?: (match: Match) => void;
}

export function MatchCard({ match, on_open }: MatchCardProps) {
  const { partner, wish } = match;

  return (
    <button
      type="button"
      onClick={() => on_open?.(match)}
      className="focus-ring flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-surface-card/70 p-4 text-left transition-colors hover:border-brand-400/30 hover:bg-surface-card"
    >
      <Avatar name={partner.name} src={partner.avatar_url} size="md" />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate font-semibold text-white">{partner.name}</p>
          {!match.is_seen ? <Badge tone="accent">Новое</Badge> : null}
        </div>
        <p className="truncate text-sm text-slate-400">{wish.title}</p>
        <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span>{format_relative_time(match.created_at)}</span>
          {partner.telegram ? (
            <span className="inline-flex items-center gap-1 text-brand-300">
              <Send className="h-3 w-3" />
              {partner.telegram}
            </span>
          ) : null}
          {partner.instagram ? (
            <span className="inline-flex items-center gap-1 text-accent-400">
              <Camera className="h-3 w-3" />
              {partner.instagram}
            </span>
          ) : null}
        </div>
      </div>
    </button>
  );
}
