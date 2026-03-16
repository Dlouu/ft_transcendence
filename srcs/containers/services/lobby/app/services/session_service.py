import os
from datetime import datetime, timedelta, timezone

import jwt
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

from app.core.extensions import r

UNAVAILABLE_MESSAGE = (
    "WARNING: Redis is unavailable, the service might be offline or bad configured in this one."
)


def generate_session_token(user_id, headers, remote_addr, room_code=None):
    """
    Generate a new session token for the lobby.

    param:
        user_id: the user id (can be None)
        headers: the header of the request
        remote_addr: the remote address of the request
        room_code: lobby room code

    return:
        The new token, the public key and the private key
    """
    private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
    public_key = private_key.public_key()

    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption(),
    ).decode("utf-8")

    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo,
    ).decode("utf-8")

    created_at = datetime.now(tz=timezone.utc) + timedelta(
        seconds=int(os.getenv("SESSION_TOKEN_EXPIRATION", "3600"))
    )
    payload = {
        "user_id": user_id,
        "agent": headers.get("User-Agent", ""),
        "remote_addr": remote_addr,
        "room_code": room_code,
        "exp": created_at,
    }

    encoded_jwt = jwt.encode(payload, private_pem, algorithm="RS256")

    return encoded_jwt, public_pem, private_pem, created_at


def store_session_token(key, public, user_id, room_code=None):
    """
    Store the given key in redis cache.

    return:
        True if the token have been successfully stored in redis cache.
    """
    if not r:
        print(UNAVAILABLE_MESSAGE, flush=True)
        return False

    mapping = {"public": public}
    if user_id is not None:
        mapping["user_id"] = user_id
    if room_code is not None:
        mapping["room_code"] = room_code

    r.hset(f"token:{key}", mapping=mapping)
    r.expire(
        f"token:{key}",
        int(os.getenv("TOKEN_CACHE_LIFETIME", os.getenv("SESSION_TOKEN_EXPIRATION", "3600"))),
    )
    return True


def delete_session_token(key):
    if not r:
        print(UNAVAILABLE_MESSAGE, flush=True)
        return False

    r.delete(f"token:{key}")
    return True


def does_session_token_exist(key):
    if not r:
        print(UNAVAILABLE_MESSAGE, flush=True)
        return False

    return r.exists(f"token:{key}")


def decode_session_token(key):
    if not r:
        print(UNAVAILABLE_MESSAGE, flush=True)
        return None

    if not does_session_token_exist(key):
        return None

    data = r.hgetall(f"token:{key}")
    payload = jwt.decode(key, data["public"], algorithms="RS256")

    return payload


def get_token_associated_data(key):
    if not r:
        print(UNAVAILABLE_MESSAGE, flush=True)
        return None

    if not does_session_token_exist(key):
        return None

    return r.hgetall(f"token:{key}")


def wrap_new_session_token(token, public):
    return {"token": token, "public": public}
