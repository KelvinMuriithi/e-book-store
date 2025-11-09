from flask import Blueprint, jsonify, request, make_response
from db import SessionLocal
from models.user import UserRole, User
from auth import hash_pw, verify_pw, sign_jwt, get_current_user, needs_rehash
import os
import traceback

bp = Blueprint("auth", __name__, url_prefix="/api/auth")

COOKIES_FLAGS = {
    "httponly": True,
    "samesite": "Lax",
    "secure": False,  # Set to True if using HTTPS
    "path": "/",
    "max_age": 60*60*24*7,  # 7 days
}

@bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(force=True, silent=False)
    email  = data.get("email", "").strip().lower()
    password = data.get("password") or ""
    role = data.get(("role") or "customer").strip().lower()
    if not email or not password:
        return {"error": "Email and password are required"}, 400
    if role not in UserRole.__members__:
        role = UserRole.customer
        
    with SessionLocal() as session:
        if session.query(User).filter_by(email=email).first():
            return {"error": "Email already registered"}, 409
        u = User(
            email=email,
            password_hash=hash_pw(password),
            role=UserRole(role)
        )
        session.add(u)
        session.commit()
        session.refresh(u)
        
        token = sign_jwt({"uid": u.id, "role": u.role.value})
        resp = make_response({"id": u.id, "email": u.email, "role": u.role.value})
        resp.set_cookie("auth", token, **COOKIES_FLAGS)
        return resp, 201
    
@bp.post("/login")
def login():
    try:
        data = request.get_json(force=True, silent=False)
        email = (data.get("email") or "").strip().lower()
        password = data.get("password") or ""
        if not email or not password:
            return {"error": "Email and password required"}, 400

        with SessionLocal() as s:
            u = s.query(User).filter_by(email=email).first()
            if not u:
                return {"error": "Invalid credentials"}, 401

            if not verify_pw(password, u.password_hash):
                return {"error": "Invalid credentials"}, 401

            # Optional: rehash if policy changed
            try:
                if needs_rehash(u.password_hash):
                    u.password_hash = hash_pw(password)
                    s.commit()
            except Exception:
                # Rehash problems shouldn't 500 the whole login
                s.rollback()

            role_value = getattr(u.role, "value", u.role)  # handles Enum or plain string
            token = sign_jwt({"uid": u.id, "role": role_value})

            resp = make_response({"id": u.id, "email": u.email, "role": role_value})
            resp.set_cookie("auth", token, **COOKIES_FLAGS)
            return resp, 200
    except Exception as e:
        print("LOGIN ERROR:", repr(e))
        traceback.print_exc()
        return {"error": "Internal server error"}, 500
    
@bp.route("/logout", methods=["POST"])
def logout():
    resp = make_response({"message": "Logged out"})
    resp.set_cookie("auth", "", **{**COOKIES_FLAGS, "max_age": 0})
    return resp, 200

@bp.route("/me", methods=["GET"])
def me():
    user = get_current_user()
    if not user:
        return {"error": "Not authenticated"}, 401
    return {"user":{"id": user.id, "email": user.email, "role": user.role.value}}, 200