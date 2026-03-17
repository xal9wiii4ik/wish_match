"""email_confirmations

Revision ID: 0002
Revises: 50d6ee0e1a30
Create Date: 2026-03-17
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '0002'
down_revision = '50d6ee0e1a30'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        'email_confirmations',
        sa.Column('id', postgresql.UUID(as_uuid=True), server_default=sa.text('gen_random_uuid()'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('token', sa.Text(), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token', name='uq_email_confirmations_token'),
    )
    op.create_index('ix_email_confirmations_user_id', 'email_confirmations', ['user_id'])
    op.create_index('ix_email_confirmations_token', 'email_confirmations', ['token'])


def downgrade() -> None:
    op.drop_index('ix_email_confirmations_token', table_name='email_confirmations')
    op.drop_index('ix_email_confirmations_user_id', table_name='email_confirmations')
    op.drop_table('email_confirmations')
