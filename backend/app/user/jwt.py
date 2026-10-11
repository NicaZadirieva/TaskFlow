from datetime import UTC, datetime, timedelta

import jwt

from app.shared.settings import Settings

settings = Settings()  # type: ignore[call-arg]
ALGORITHM = "HS256"


def create_access_token(user_id: int) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=settings.common_app.EXPIRE_MINUTES)
    payload = {"sub": str(user_id), "exp": expire}
    return jwt.encode(
        payload=payload, key=settings.common_app.SECRET, algorithm=ALGORITHM
    )


def decode_access_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, settings.common_app.SECRET, ALGORITHM)
        return int(payload["sub"])
    except (jwt.PyJWTError, ValueError, KeyError):
        return None
