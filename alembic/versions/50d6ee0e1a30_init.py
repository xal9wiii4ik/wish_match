"""init

Revision ID: 50d6ee0e1a30
Revises:
Create Date: 2026-03-17 16:28:05.574230

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from geoalchemy2 import Geography
from sqlalchemy.dialects.postgresql import ENUM as PG_ENUM


# revision identifiers, used by Alembic.
revision: str = "50d6ee0e1a30"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create all initial tables."""
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")

    # --- users ---
    op.create_table(
        "users",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("email", sa.Text(), nullable=False),
        sa.Column("password_hash", sa.Text(), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("avatar_url", sa.Text(), nullable=True),
        sa.Column("bio", sa.Text(), nullable=True),
        sa.Column("city", sa.Text(), nullable=True),
        sa.Column("location", Geography(geometry_type="POINT", srid=4326), nullable=True),
        sa.Column("telegram", sa.Text(), nullable=True),
        sa.Column("instagram", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=True, default=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("email"),
        sa.CheckConstraint(
            "telegram IS NOT NULL OR instagram IS NOT NULL", name="users_contact_check"
        ),
    )

    # --- categories ---
    op.create_table(
        "categories",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("slug", sa.Text(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
        sa.UniqueConstraint("slug"),
    )

    # --- wishes ---
    op.create_table(
        "wishes",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("category_id", sa.UUID(), nullable=False),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("location", Geography(geometry_type="POINT", srid=4326), nullable=False),
        sa.Column("location_name", sa.Text(), nullable=True),
        sa.Column("city", sa.Text(), nullable=True),
        sa.Column("status", sa.Text(), server_default="active", nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("max_participants", sa.Integer(), server_default="1", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["category_id"], ["categories.id"], ondelete="CASCADE"),
        sa.CheckConstraint(
            "status IN ('active','closed','expired')", name="wishes_status_check"
        ),
    )
    op.create_index("ix_wishes_user_id", "wishes", ["user_id"])
    op.create_index("ix_wishes_category_id", "wishes", ["category_id"])
    op.create_index("ix_wishes_status", "wishes", ["status"])
    op.create_index("ix_wishes_expires_at", "wishes", ["expires_at"])
    op.create_index("ix_wishes_location", "wishes", ["location"], postgresql_using="gist")

    # --- swipes ---
    op.create_table(
        "swipes",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("user_id", sa.UUID(), nullable=False),
        sa.Column("wish_id", sa.UUID(), nullable=False),
        sa.Column("is_like", sa.Boolean(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["wish_id"], ["wishes.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("user_id", "wish_id", name="uq_swipes_user_wish"),
    )

    # --- matches ---
    op.create_table(
        "matches",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("wish_id", sa.UUID(), nullable=False),
        sa.Column("user1_id", sa.UUID(), nullable=False),
        sa.Column("user2_id", sa.UUID(), nullable=False),
        sa.Column("user1_seen", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("user2_seen", sa.Boolean(), server_default="false", nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["wish_id"], ["wishes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user1_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user2_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("wish_id", "user1_id", "user2_id", name="uq_matches_wish_users"),
    )

    # --- blocks ---
    block_reason_enum = PG_ENUM(
        "spam", "harassment", "inappropriate", "other", name="block_reason", create_type=False
    )
    op.execute(
        "DO $$ BEGIN "
        "CREATE TYPE block_reason AS ENUM ('spam', 'harassment', 'inappropriate', 'other'); "
        "EXCEPTION WHEN duplicate_object THEN null; "
        "END $$;"
    )

    op.create_table(
        "blocks",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("blocker_id", sa.UUID(), nullable=False),
        sa.Column("blocked_id", sa.UUID(), nullable=False),
        sa.Column("reason", block_reason_enum, nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("screenshot_urls", sa.ARRAY(sa.Text()), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=True,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(["blocker_id"], ["users.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["blocked_id"], ["users.id"], ondelete="CASCADE"),
        sa.UniqueConstraint("blocker_id", "blocked_id", name="uq_blocks_blocker_blocked"),
        sa.CheckConstraint("blocker_id != blocked_id", name="blocks_no_self_block"),
    )


def downgrade() -> None:
    """Drop all tables in reverse order."""
    op.drop_table("blocks")
    sa.Enum(name="block_reason").drop(op.get_bind(), checkfirst=True)
    op.drop_table("matches")
    op.drop_table("swipes")
    op.drop_index("ix_wishes_location", table_name="wishes")
    op.drop_index("ix_wishes_expires_at", table_name="wishes")
    op.drop_index("ix_wishes_status", table_name="wishes")
    op.drop_index("ix_wishes_category_id", table_name="wishes")
    op.drop_index("ix_wishes_user_id", table_name="wishes")
    op.drop_table("wishes")
    op.drop_table("categories")
    op.drop_table("users")
    op.execute("DROP EXTENSION IF EXISTS postgis")
