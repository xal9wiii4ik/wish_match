import { Camera, Heart, Send } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { app_routes, build_wish_detail_path } from "@/config/routes";
import { format_date } from "@/lib/format";
import {
  Avatar,
  Button,
  EmptyState,
  Modal,
  Skeleton,
} from "@/components/ui";
import { PageHeader } from "@/components/layout/PageHeader";
import type { Match } from "@/types";

import { MatchCard } from "../components/MatchCard";
import { useMarkMatchSeen, useMatches } from "../hooks/use-matches";

export function MatchesPage() {
  const navigate = useNavigate();
  const matches = useMatches();
  const mark_seen = useMarkMatchSeen();
  const [active_match, set_active_match] = useState<Match | null>(null);

  function open_match(match: Match): void {
    set_active_match(match);
    if (!match.is_seen) {
      mark_seen.mutate(match.id);
    }
  }

  return (
    <div>
      <PageHeader
        title="Совпадения"
        description="Люди, которые тоже хотят это осуществить"
      />

      {matches.isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
      ) : matches.data && matches.data.length > 0 ? (
        <div className="space-y-3">
          {matches.data.map((match) => (
            <MatchCard key={match.id} match={match} on_open={open_match} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Heart}
          title="Пока нет совпадений"
          description="Свайпайте желания в ленте — и здесь появятся ваши совпадения."
          action={
            <Button onClick={() => navigate(app_routes.discover)}>
              В ленту
            </Button>
          }
        />
      )}

      <Modal
        is_open={active_match !== null}
        on_close={() => set_active_match(null)}
        title="Совпадение"
      >
        {active_match ? (
          <div className="flex flex-col items-center gap-4 text-center">
            <Avatar
              name={active_match.partner.name}
              src={active_match.partner.avatar_url}
              size="lg"
            />
            <div>
              <p className="text-lg font-semibold text-white">
                {active_match.partner.name}
              </p>
              <p className="text-sm text-slate-400">
                «{active_match.wish.title}»
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {format_date(active_match.created_at)}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {active_match.partner.telegram ? (
                <a
                  href={`https://t.me/${active_match.partner.telegram.replace("@", "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-brand-500/15 px-4 py-2 text-sm font-medium text-brand-200 hover:bg-brand-500/25"
                >
                  <Send className="h-4 w-4" />
                  Telegram
                </a>
              ) : null}
              {active_match.partner.instagram ? (
                <a
                  href={`https://instagram.com/${active_match.partner.instagram}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl bg-accent-500/15 px-4 py-2 text-sm font-medium text-accent-400 hover:bg-accent-500/25"
                >
                  <Camera className="h-4 w-4" />
                  Instagram
                </a>
              ) : null}
            </div>

            <Button
              variant="secondary"
              className="w-full"
              onClick={() => {
                set_active_match(null);
                navigate(build_wish_detail_path(active_match.wish.id));
              }}
            >
              Открыть желание
            </Button>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
