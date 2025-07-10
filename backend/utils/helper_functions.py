from urllib.parse import urlparse
from fastapi import HTTPException, status, Cookie
from jose import jwt, JWTError
from dotenv import load_dotenv
import os
from redis import Redis
import json
import logging
from datetime import datetime
import sentry_sdk

logging.basicConfig(
    level=logging.INFO
)

logger = logging.getLogger("functions-logger")

load_dotenv(override=True)

SECRET_KEY = os.getenv("SECRET_KEY")

redis_url = os.getenv("REDIS_URL")
parsed_url = urlparse(redis_url)

r = Redis(
    host=parsed_url.hostname, 
    port=parsed_url.port, 
    password=parsed_url.password,
    db=int(parsed_url.path.lstrip('/')) if parsed_url.path else 0,
    decode_responses=False
    )


def raise_http500_exception(e: Exception):
    sentry_sdk.capture_exception(e)
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=f"Something went wrong: {str(e)}")


def invalid_token_exception():
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")


def decode_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("sub")
        type = payload.get("type")

        if not user_id or not type:
            raise invalid_token_exception()

        if type == "refresh":
            return {"user_id": user_id, "type": type, }

        plan = payload.get("plan")
        if not plan:
            raise invalid_token_exception()
        return {"user_id": user_id, "type": type, "plan": plan}
    except JWTError:
        raise invalid_token_exception()


def get_current_user(access_token: str = Cookie(None)):
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    return decode_token(access_token)


def check_premium(user: dict):
    if user.get("plan") != "premium":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Only for premium users"
        )


def get_cache_key(month, section, user_id):
    if month is None:
        return f"{section}:{user_id}"
    else:
        return f"{section}-{month}:{user_id}"


def get_from_cache(key: str):
    cached = r.get(key)
    if cached:
        try:
            return json.loads(cached)
        except json.JSONDecodeError:
            logger.warning(f"Cache corrupt for key: {key}")
    return None


def set_cache(key: str, value: list | dict, expire: int = 300):
    r.set(key, json.dumps(value), expire)


def delete_cache(user_id: str, sections: list[str]):
    for section in sections:
        r.delete(f"{section}:{user_id}")
        for i in range(1, datetime.now().month + 1):
            r.delete(f"{section}-{i}:{user_id}")


def filter_by_month(aggregation, month):
    aggregation.insert(1, {
        "$addFields": {
            "month": {"$month": "$date"}
        }
    })

    aggregation.insert(2, {
        "$match": {
            "month": month
        }
    })
