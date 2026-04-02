# WishMatch — Database Schema

Schema version: **006**

## Extensions

| Extension | Purpose |
|-----------|---------|
| `postgis`  | Geography types and spatial indexing |

---

## Tables

### users

Registered users of the service.

| Column          | Type                   | Nullable | Default              | Notes |
|-----------------|------------------------|----------|----------------------|-------|
| `id`            | UUID                   | NOT NULL | `gen_random_uuid()`  | Primary key |
| `email`         | TEXT                   | NOT NULL | —                    | Unique |
| `password_hash` | TEXT                   | NOT NULL | —                    | bcrypt hash |
| `name`          | TEXT                   | NOT NULL | —                    | Display name |
| `avatar_url`    | TEXT                   | NULL     | —                    | |
| `bio`           | TEXT                   | NULL     | —                    | |
| `city`          | TEXT                   | NULL     | —                    | Human-readable city |
| `location`      | geography(Point, 4326) | NULL     | —                    | User's geo position (WGS-84) |
| `telegram`      | TEXT                   | NULL     | —                    | At least one of telegram/instagram required |
| `instagram`     | TEXT                   | NULL     | —                    | At least one of telegram/instagram required |
| `is_active`     | BOOLEAN                | NOT NULL | `true`               | Soft-delete / ban flag |
| `created_at`    | TIMESTAMPTZ            | NOT NULL | `now()`              | |

**Constraints:**
- `users_at_least_one_contact` — `telegram IS NOT NULL OR instagram IS NOT NULL`

**Indexes:**
- `users_pkey` — PRIMARY KEY on `id`
- `users_email_key` — UNIQUE on `email`

---

### categories

Predefined wish categories. Seeded via migration `0006_seed_categories`.

**Initial categories:** food, travel, sport, entertainment, culture, education, outdoor, nightlife.

| Column       | Type        | Nullable | Default             | Notes |
|--------------|-------------|----------|---------------------|-------|
| `id`         | UUID        | NOT NULL | `gen_random_uuid()` | Primary key |
| `name`       | TEXT        | NOT NULL | —                   | Unique display name |
| `slug`       | TEXT        | NOT NULL | —                   | Unique URL-safe slug |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()`             | |

**Indexes:**
- `categories_pkey` — PRIMARY KEY on `id`
- `categories_name_key` — UNIQUE on `name`
- `categories_slug_key` — UNIQUE on `slug`

---

### wishes

A wish is a user's proposal to do something together (go to a restaurant, travel, etc.).

| Column             | Type                   | Nullable | Default              | Notes |
|--------------------|------------------------|----------|----------------------|-------|
| `id`               | UUID                   | NOT NULL | `gen_random_uuid()`  | Primary key |
| `user_id`          | UUID                   | NOT NULL | —                    | FK → users |
| `category_id`      | UUID                   | NOT NULL | —                    | FK → categories |
| `title`            | TEXT                   | NOT NULL | —                    | |
| `description`      | TEXT                   | NULL     | —                    | |
| `location`         | geography(Point, 4326) | NOT NULL | —                    | Wish location (WGS-84) |
| `location_name`    | TEXT                   | NULL     | —                    | Human-readable place, e.g. "Moscow, Gorky Park" |
| `city`             | TEXT                   | NULL     | —                    | |
| `status`           | TEXT                   | NOT NULL | `'active'`           | One of: `active`, `closed`, `expired` |
| `expires_at`       | TIMESTAMPTZ            | NULL     | —                    | When the wish auto-expires |
| `max_participants` | INTEGER                | NOT NULL | `1`                  | Max number of companions |
| `created_at`       | TIMESTAMPTZ            | NOT NULL | `now()`              | |

**Constraints:**
- `wishes_status_check` — `status IN ('active', 'closed', 'expired')`

**Foreign Keys:**
- `user_id` → `users(id)` ON DELETE CASCADE
- `category_id` → `categories(id)` ON DELETE CASCADE

**Indexes:**
- `wishes_pkey` — PRIMARY KEY on `id`
- `idx_wishes_user_id` — B-tree on `user_id`
- `idx_wishes_category_id` — B-tree on `category_id`
- `idx_wishes_status` — B-tree on `status`
- `idx_wishes_expires_at` — B-tree on `expires_at`
- `idx_wishes_location` — GIST on `location` (spatial queries)

---

### swipes

Records a user's like or dislike of a wish. Each (user, wish) pair is unique.

| Column       | Type        | Nullable | Default             | Notes |
|--------------|-------------|----------|---------------------|-------|
| `id`         | UUID        | NOT NULL | `gen_random_uuid()` | Primary key |
| `user_id`    | UUID        | NOT NULL | —                   | FK → users |
| `wish_id`    | UUID        | NOT NULL | —                   | FK → wishes |
| `is_like`    | BOOLEAN     | NOT NULL | —                   | `true` = like, `false` = dislike |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()`             | |

**Constraints:**
- `uq_swipes_user_wish` — UNIQUE on `(user_id, wish_id)`

**Foreign Keys:**
- `user_id` → `users(id)` ON DELETE CASCADE
- `wish_id` → `wishes(id)` ON DELETE CASCADE

**Indexes:**
- `swipes_pkey` — PRIMARY KEY on `id`
- `ix_swipes_user_id` — B-tree on `user_id`
- `ix_swipes_wish_id` — B-tree on `wish_id`

---

### matches

Created when a user likes a wish whose owner also swiped right (mutual interest).
`user1_id` is the wish owner; `user2_id` is the person who liked.

| Column       | Type        | Nullable | Default             | Notes |
|--------------|-------------|----------|---------------------|-------|
| `id`         | UUID        | NOT NULL | `gen_random_uuid()` | Primary key |
| `wish_id`    | UUID        | NOT NULL | —                   | FK → wishes |
| `user1_id`   | UUID        | NOT NULL | —                   | FK → users — wish owner |
| `user2_id`   | UUID        | NOT NULL | —                   | FK → users — person who liked |
| `user1_seen` | BOOLEAN     | NOT NULL | `false`             | Whether user1 has seen this match |
| `user2_seen` | BOOLEAN     | NOT NULL | `false`             | Whether user2 has seen this match |
| `created_at` | TIMESTAMPTZ | NOT NULL | `now()`             | |

**Constraints:**
- `uq_matches_wish_users` — UNIQUE on `(wish_id, user1_id, user2_id)`

**Foreign Keys:**
- `wish_id` → `wishes(id)` ON DELETE CASCADE
- `user1_id` → `users(id)` ON DELETE CASCADE
- `user2_id` → `users(id)` ON DELETE CASCADE

**Indexes:**
- `matches_pkey` — PRIMARY KEY on `id`
- `ix_matches_wish_id` — B-tree on `wish_id`
- `ix_matches_user1_id` — B-tree on `user1_id`
- `ix_matches_user2_id` — B-tree on `user2_id`

---

### blocks

Allows a user to block another user. Blocks are one-directional.

| Column            | Type        | Nullable | Default             | Notes |
|-------------------|-------------|----------|---------------------|-------|
| `id`              | UUID        | NOT NULL | `gen_random_uuid()` | Primary key |
| `blocker_id`      | UUID        | NOT NULL | —                   | FK → users — who is blocking |
| `blocked_id`      | UUID        | NOT NULL | —                   | FK → users — who is blocked |
| `reason`          | TEXT        | NOT NULL | —                   | One of: `spam`, `harassment`, `inappropriate`, `other` |
| `description`     | TEXT        | NULL     | —                   | Optional free-form explanation |
| `screenshot_urls` | TEXT[]      | NULL     | —                   | Array of screenshot URLs |
| `created_at`      | TIMESTAMPTZ | NOT NULL | `now()`             | |

**Constraints:**
- `uq_blocks_blocker_blocked` — UNIQUE on `(blocker_id, blocked_id)`
- `chk_blocks_not_self` — `blocker_id != blocked_id`
- `blocks_reason_check` — `reason IN ('spam', 'harassment', 'inappropriate', 'other')`

**Foreign Keys:**
- `blocker_id` → `users(id)` ON DELETE CASCADE
- `blocked_id` → `users(id)` ON DELETE CASCADE

**Indexes:**
- `blocks_pkey` — PRIMARY KEY on `id`
- `ix_blocks_blocker_id` — B-tree on `blocker_id`
- `ix_blocks_blocked_id` — B-tree on `blocked_id`

---

## Relations Overview

```
users ──< wishes ──< swipes >── users
             |
             └──< matches >── users (user1_id, user2_id)

users ──< blocks >── users
```

- One user → many wishes
- One wish → many swipes from different users
- A match is tied to a wish and two users (owner + liker)
- Blocks are between any two distinct users
