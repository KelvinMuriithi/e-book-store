import os
from flask import Blueprint, jsonify, abort
from db import SessionLocal
from models.user import User, UserRole
from auth import hash_pw

bp = Blueprint("dev_user", __name__, url_prefix="/api/dev-user")

def _ensure_user(s, email, password, role: UserRole):
    u = s.query(User).filter_by(email=email).first()
    if u:
        # update role if changed
        if u.role != role:
            u.role = role
        return u
    u = User(email=email, password_hash=hash_pw(password), role=role)
    s.add(u)
    return u

@bp.post("/seed-users")
def seed_users():
    # Safety: only allow in dev (set ENV=dev or FLASK_ENV=development)
    env = os.getenv("ENV") or os.getenv("FLASK_ENV") or "production"
    if env not in ("dev", "development"):
        abort(403, description="Disabled outside development")

    seed = [
        ("admin@example.com",   "admin123",  UserRole.admin),
        ("author@example.com",  "author123", UserRole.author),
        ("customer@example.com","cust123",   UserRole.customer),
    ]
    with SessionLocal() as s:
        users = []
        for email, pw, role in seed:
            u = _ensure_user(s, email, pw, role)
            users.append({"email": email, "role": u.role.value})
        s.commit()
    return jsonify({"ok": True, "seeded": users})