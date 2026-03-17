"""ORM models — import all to ensure they are registered with Base.metadata."""

from app.models.block import Block
from app.models.category import Category
from app.models.email_confirmation import EmailConfirmation
from app.models.match import Match
from app.models.swipe import Swipe
from app.models.user import User
from app.models.wish import Wish

__all__ = ["Block", "Category", "EmailConfirmation", "Match", "Swipe", "User", "Wish"]
