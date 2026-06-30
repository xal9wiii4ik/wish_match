import type {
  Block,
  BlockPayload,
  Category,
  Match,
  ProfileUpdatePayload,
  SwipePayload,
  SwipeResult,
  User,
  Wish,
  WishCreatePayload,
  WishFeedQuery,
  WishUpdatePayload,
} from "@/types";

import {
  mock_current_user,
  seed_categories,
  seed_matches,
  seed_wishes,
} from "./seed-data";

interface MockState {
  current_user: User;
  categories: Category[];
  wishes: Wish[];
  my_wishes: Wish[];
  matches: Match[];
  blocks: Block[];
  swiped_wish_ids: Set<string>;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

const state: MockState = {
  current_user: clone(mock_current_user),
  categories: clone(seed_categories),
  wishes: clone(seed_wishes),
  my_wishes: [],
  matches: clone(seed_matches),
  blocks: [],
  swiped_wish_ids: new Set<string>(),
};

function delay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve(value), ms);
  });
}

function new_id(): string {
  return crypto.randomUUID();
}

export const mock_backend = {
  async register(): Promise<{ message: string }> {
    return delay({
      message: "Регистрация успешна. Проверьте почту для подтверждения.",
    });
  },

  async confirm_email(): Promise<{ message: string }> {
    return delay({ message: "Email подтверждён. Теперь вы можете войти." });
  },

  async login(): Promise<{ access_token: string; token_type: string }> {
    return delay({ access_token: `mock.${new_id()}`, token_type: "bearer" });
  },

  async get_current_user(): Promise<User> {
    return delay(clone(state.current_user));
  },

  async update_profile(payload: ProfileUpdatePayload): Promise<User> {
    state.current_user = {
      ...state.current_user,
      ...payload,
      location:
        payload.location !== undefined
          ? payload.location
          : state.current_user.location,
    };
    return delay(clone(state.current_user));
  },

  async list_categories(): Promise<Category[]> {
    return delay(clone(state.categories));
  },

  async get_wish_feed(query: WishFeedQuery): Promise<Wish[]> {
    let result = state.wishes.filter(
      (wish) => !state.swiped_wish_ids.has(wish.id)
    );
    if (query.category_id) {
      result = result.filter((wish) => wish.category_id === query.category_id);
    }
    return delay(clone(result));
  },

  async get_my_wishes(): Promise<Wish[]> {
    return delay(clone(state.my_wishes));
  },

  async get_wish(wish_id: string): Promise<Wish> {
    const found = [...state.wishes, ...state.my_wishes].find(
      (wish) => wish.id === wish_id
    );
    if (!found) {
      throw new Error("Wish not found");
    }
    return delay(clone(found));
  },

  async create_wish(payload: WishCreatePayload): Promise<Wish> {
    const wish: Wish = {
      id: new_id(),
      user_id: state.current_user.id,
      category_id: payload.category_id,
      title: payload.title,
      description: payload.description,
      location: payload.location,
      status: "active",
      max_participants: payload.max_participants,
      spots_left: payload.max_participants,
      expires_at: payload.expires_at,
      created_at: new Date().toISOString(),
    };
    state.my_wishes = [wish, ...state.my_wishes];
    return delay(clone(wish));
  },

  async update_wish(
    wish_id: string,
    payload: WishUpdatePayload
  ): Promise<Wish> {
    const index = state.my_wishes.findIndex((wish) => wish.id === wish_id);
    if (index === -1) {
      throw new Error("Wish not found");
    }
    const existing = state.my_wishes[index];
    const updated: Wish = {
      ...existing,
      title: payload.title ?? existing.title,
      description: payload.description ?? existing.description,
      category_id: payload.category_id ?? existing.category_id,
      location: payload.location ?? existing.location,
      max_participants: payload.max_participants ?? existing.max_participants,
      expires_at: payload.expires_at ?? existing.expires_at,
      status: payload.status ?? existing.status,
    };
    state.my_wishes[index] = updated;
    return delay(clone(updated));
  },

  async delete_wish(wish_id: string): Promise<void> {
    state.my_wishes = state.my_wishes.filter((wish) => wish.id !== wish_id);
    return delay(undefined);
  },

  async swipe(payload: SwipePayload): Promise<SwipeResult> {
    state.swiped_wish_ids.add(payload.wish_id);
    const wish = state.wishes.find((item) => item.id === payload.wish_id);
    const is_match = Boolean(payload.is_like && wish && Math.random() < 0.45);

    if (is_match && wish) {
      const category = state.categories.find(
        (item) => item.id === wish.category_id
      );
      const match: Match = {
        id: new_id(),
        wish,
        partner_id: wish.user_id,
        partner: {
          id: wish.user_id,
          name: category ? `Участник · ${category.name}` : "Участник",
          avatar_url: null,
          telegram: "demo_partner",
          instagram: null,
        },
        is_seen: false,
        created_at: new Date().toISOString(),
      };
      state.matches = [match, ...state.matches];
      return delay({ is_match: true, match_id: match.id });
    }

    return delay({ is_match: false, match_id: null });
  },

  async list_matches(): Promise<Match[]> {
    return delay(clone(state.matches));
  },

  async mark_match_seen(match_id: string): Promise<void> {
    const match = state.matches.find((item) => item.id === match_id);
    if (match) {
      match.is_seen = true;
    }
    return delay(undefined);
  },

  async list_blocks(): Promise<Block[]> {
    return delay(clone(state.blocks));
  },

  async create_block(payload: BlockPayload): Promise<Block> {
    const block: Block = {
      id: new_id(),
      blocked_id: payload.blocked_id,
      blocked_name: "Пользователь",
      reason: payload.reason,
      description: payload.description,
      created_at: new Date().toISOString(),
    };
    state.blocks = [block, ...state.blocks];
    return delay(clone(block));
  },
};
