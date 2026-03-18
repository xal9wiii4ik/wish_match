"""add gender column to users

Revision ID: 0004
Revises: 0003
Create Date: 2026-03-18
"""
import sqlalchemy as sa

from alembic import op

revision = '0004'
down_revision = '0003'
branch_labels = None
depends_on = None

gender_enum = sa.Enum("male", "female", name="gender_enum")


def upgrade() -> None:
    gender_enum.create(op.get_bind())
    op.add_column("users", sa.Column("gender", gender_enum, nullable=True))


def downgrade() -> None:
    op.drop_column("users", "gender")
    gender_enum.drop(op.get_bind())
