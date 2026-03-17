"""Application-level exception hierarchy."""


class WishMatchException(Exception):
    """Base exception for the WishMatch application."""


class NotFoundError(WishMatchException):
    """Raised when a requested resource does not exist."""


class ConflictError(WishMatchException):
    """Raised on conflicting state, e.g. duplicate resources."""


class ForbiddenError(WishMatchException):
    """Raised when the user lacks permission for the operation."""
