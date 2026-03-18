.PHONY: test test-cov up down logs shell migrate lint typecheck

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

lint:
	ruff check app/ tests/
	ruff format --check app/ tests/

lint-fix:
	ruff check --fix app/ tests/
	ruff format app/ tests/

typecheck:
	mypy app/
