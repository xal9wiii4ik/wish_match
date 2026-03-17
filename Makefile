.PHONY: test test-cov up down logs shell migrate

up:
	docker-compose up -d --build

down:
	docker-compose down

logs:
	docker-compose logs -f app

shell:
	docker-compose exec app bash

migrate:
	docker-compose exec app alembic upgrade head

test:
	docker-compose exec app python -m pytest tests/ -v

test-cov:
	docker-compose exec app python -m pytest tests/ -v --cov=app --cov-report=term-missing --cov-report=html:htmlcov
