import os, time, datetime, jwt
from functools import wraps
from flask import request, jsonify, abort
from passlib.context import CryptContext
from models.user import User, UserRole
from db import SessionLocal

pwd_context = CryptContext(schemes=["pbkdf2_sha256"],  pbkdf2_sha256__rounds=310000,)
JWT_SECRET = os.getenv("JWT_SECRET", "please_change_me_in_production")
JWT_ISS = "ebook-store"
JWT_EXP_SEC = 60*60*24*7  # 7 days

def hash_pw(pw:str) -> str:
    return pwd_context.hash(pw)

def verify_pw(pw:str, pw_hash:str) -> bool:
    return pwd_context.verify(pw, pw_hash)

def needs_rehash(pw_hash:str) -> bool:
    return pwd_context.needs_update(pw_hash)

def sign_jwt(payload: dict) -> str:
    now = int(time.time())
    body = {"iat": now, "exp": now + 60*60*24*7, **payload}
    return jwt.encode(body, JWT_SECRET, algorithm="HS256")

def decode_jwt(token:str):
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"], options={"require": ["exp", "iat"]})

def get_current_user():
    token =request.cookies.get("auth")
    if not token:
        return None
    try:
        data = decode_jwt(token)
    except Exception:
        return None
    uuid = data.get("uid")
    with SessionLocal() as session:
        return session.get(User, uuid)
    
def require_auth(fn):
    @wraps(fn)
    def wrapper(*args, **kwargs):
        user = get_current_user()
        if not user:
            abort(401, description="Authentication required")
        return fn(user, *args, **kwargs)
    return wrapper

def require_role(*roles):
    def decorator(fn):
        @wraps(fn)
        def wrapper(*args, **kwargs):
            user = get_current_user()
            if not user:
                abort(401, description="Authentication required")
            user_role = getattr(user.role, "value", user.role)
            role_names = [getattr(r, "value", r) for r in roles]
            if user_role not in role_names:
                abort(403, description="Forbidden")
            return fn(*args, **kwargs)
        return wrapper
    return decorator