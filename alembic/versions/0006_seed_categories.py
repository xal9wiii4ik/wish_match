"""seed initial categories

Revision ID: 0006
Revises: 0005
Create Date: 2026-03-30
"""
from typing import Sequence, Union

from alembic import op

revision: str = "0006"
down_revision: Union[str, Sequence[str]] = "0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

CATEGORIES = [
    ("food", "Еда и рестораны"),
    ("travel", "Путешествия"),
    ("sport", "Спорт"),
    ("entertainment", "Развлечения"),
    ("culture", "Культура"),
    ("education", "Образование"),
    ("outdoor", "Активный отдых"),
    ("nightlife", "Ночная жизнь"),
]


def upgrade() -> None:
    for slug, name in CATEGORIES:
        op.execute(
            "INSERT INTO categories (id, slug, name, created_at) "
            f"VALUES (gen_random_uuid(), '{slug}', '{name}', now())"
        )


def downgrade() -> None:
    slugs = ", ".join(f"'{slug}'" for slug, _ in CATEGORIES)
    op.execute(f"DELETE FROM categories WHERE slug IN ({slugs})")
