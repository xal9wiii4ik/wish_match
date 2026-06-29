# WishMatch

Платформа для нахождения единомышленников и исполнения желаний.

## Особенности

- ✨ Красивый современный веб-интерфейс с анимациями
- 🎯 Умный подбор по желаниям
- 🌍 Геолокация для поиска людей рядом
- 💬 Общение и планирование встреч
- 🔒 Безопасность данных

## Быстрый старт

### Требования

- Python 3.12+
- PostgreSQL (для production) или SQLite (для разработки)

### Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/xal9wiii4ik/wish_match.git
cd wish_match
```

2. Установите зависимости:
```bash
pip install -r requirements.txt
```

3. Создайте файл `.env` на основе `.env.example`:
```bash
cp .env.example .env
```

Для быстрого старта с SQLite используйте:
```env
DATABASE_URL=sqlite+aiosqlite:///./test.db
SECRET_KEY=your-secret-key-here
```

4. Запустите сервер:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

5. Откройте в браузере:
```
http://localhost:8000
```

## API Документация

После запуска сервера документация API доступна по адресу:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Структура проекта

```
.
├── app/
│   ├── api/              # API endpoints
│   ├── models/           # Database models
│   ├── services/         # Business logic
│   ├── static/           # Static files (CSS, JS)
│   ├── templates/        # HTML templates
│   ├── auth/             # Authentication
│   └── main.py           # Application entry point
├── alembic/              # Database migrations
├── tests/                # Tests
└── requirements.txt      # Python dependencies
```

## Разработка

### Запуск с Docker

```bash
docker-compose up
```

### Тесты

```bash
pytest
```

## Production

Для production окружения используйте PostgreSQL и настройте переменные окружения:

```env
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/database
SECRET_KEY=your-secure-secret-key
SMTP_HOST=your-smtp-host
SMTP_USER=your-smtp-user
SMTP_PASSWORD=your-smtp-password
```

## Лицензия

© 2026 WishMatch
