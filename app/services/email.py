"""Email sending service."""

import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import aiosmtplib

from app.config import settings

logger = logging.getLogger(__name__)


async def send_confirmation_email(to_email: str, confirmation_url: str) -> None:
    """Send email confirmation link to the user."""
    message = MIMEMultipart("alternative")
    message["Subject"] = "Подтвердите ваш email — WishMatch"
    message["From"] = settings.SMTP_FROM
    message["To"] = to_email

    html = f"""
    <p>Добро пожаловать в WishMatch!</p>
    <p>Подтвердите ваш email, перейдя по ссылке:</p>
    <p><a href="{confirmation_url}">{confirmation_url}</a></p>
    <p>Ссылка действительна 24 часа.</p>
    """
    message.attach(MIMEText(html, "html"))

    await aiosmtplib.send(
        message,
        hostname=settings.SMTP_HOST,
        port=settings.SMTP_PORT,
        username=settings.SMTP_USER or None,
        password=settings.SMTP_PASSWORD or None,
        start_tls=settings.SMTP_PORT == 587,
    )
    logger.info("Confirmation email sent to %s", to_email)
