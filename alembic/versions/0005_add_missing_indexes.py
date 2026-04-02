"""add missing indexes on swipes, matches, blocks

Revision ID: 0005
Revises: 0004
Create Date: 2026-03-30
"""
from typing import Sequence, Union

from alembic import op

revision: str = "0005"
down_revision: Union[str, Sequence[str]] = "0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # swipes
    op.create_index("ix_swipes_user_id", "swipes", ["user_id"])
    op.create_index("ix_swipes_wish_id", "swipes", ["wish_id"])

    # matches
    op.create_index("ix_matches_wish_id", "matches", ["wish_id"])
    op.create_index("ix_matches_user1_id", "matches", ["user1_id"])
    op.create_index("ix_matches_user2_id", "matches", ["user2_id"])

    # blocks
    op.create_index("ix_blocks_blocker_id", "blocks", ["blocker_id"])
    op.create_index("ix_blocks_blocked_id", "blocks", ["blocked_id"])


def downgrade() -> None:
    op.drop_index("ix_blocks_blocked_id", table_name="blocks")
    op.drop_index("ix_blocks_blocker_id", table_name="blocks")
    op.drop_index("ix_matches_user2_id", table_name="matches")
    op.drop_index("ix_matches_user1_id", table_name="matches")
    op.drop_index("ix_matches_wish_id", table_name="matches")
    op.drop_index("ix_swipes_wish_id", table_name="swipes")
    op.drop_index("ix_swipes_user_id", table_name="swipes")
