"""remove users_contact_check constraint

Revision ID: 0003
Revises: 0002
Create Date: 2026-03-17
"""
from alembic import op

revision = '0003'
down_revision = '0002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.drop_constraint('users_contact_check', 'users', type_='check')


def downgrade() -> None:
    op.create_check_constraint(
        'users_contact_check',
        'users',
        'telegram IS NOT NULL OR instagram IS NOT NULL',
    )
