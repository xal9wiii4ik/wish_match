# WishMatch Backend

REST API для мобильного приложения WishMatch — сервиса поиска компании по интересам и планам.

## Стек

- Python 3.11 / FastAPI
- PostgreSQL + PostGIS (геозапросы)
- SQLAlchemy async / Alembic
- Pydantic v2 / JWT / bcrypt
- pytest + httpx (интеграционные тесты)
- Docker / docker-compose

## Запуск

```bash
make up        # поднять контейнеры
make migrate   # применить миграции
make test      # запустить тесты
make logs      # логи приложения
```

---

## Реализованные фичи

### Auth
- `POST /auth/register` — регистрация с подтверждением email
- `GET /auth/confirm-email` — подтверждение по токену
- `POST /auth/login` — JWT авторизация

### Profile
- `GET /v1/users/me` — профиль текущего пользователя
- `PATCH /v1/users/me` — частичное обновление профиля

Правила: обязателен telegram или instagram (для связи после матча). Локация хранится как PostGIS POINT.

### Wishes
- `POST /v1/wishes` — создать желание
- `GET /v1/wishes/my` — свои желания
- `GET /v1/wishes/feed` — лента чужих желаний (геофильтрация ST_DWithin, сортировка по расстоянию)
- `PATCH /v1/wishes/{id}` — редактировать
- `DELETE /v1/wishes/{id}` — удалить

Желание может быть групповым (`max_participants` 1–100). При достижении лимита матчей wish закрывается автоматически. Категории: food, travel, sport, entertainment, culture, education, outdoor, nightlife.

### Swipes & Matches
- `POST /v1/swipes` — свайп: лайк сразу создаёт матч, пасс записывается
- `GET /v1/matches` — список своих матчей (пагинация, фильтр `?wish_id=`)
- `GET /v1/matches/unseen-count` — кол-во непросмотренных матчей
- `GET /v1/matches/{match_id}` — детали матча
- `PATCH /v1/matches/{match_id}/seen` — пометить просмотренным

**User Flow:**
1. Пользователь видит в ленте чужие желания — своё желание иметь **не обязательно**
2. Лайкает wish → матч создаётся сразу (атомарно)
3. Пасс → свайп записывается, матча нет
4. При достижении `max_participants` матчей — wish закрывается автоматически
5. Владелец wish видит участников через `GET /v1/matches?wish_id=<id>`
6. После матча открывается чат, становятся доступны контакты (telegram/instagram)

---

## Планируется

- Blocks & Reports — блокировка пользователей и жалобы
- Chat — обмен сообщениями внутри матча
