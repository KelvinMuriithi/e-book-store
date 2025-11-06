from flask import Blueprint
from db import SessionLocal
from models.book import Book

bp = Blueprint("dev", __name__, url_prefix="/api/dev")

@bp.post("/seed-books")
def seed_books():
    sample = [
        {"title":"Flask for Busy People","author":"A. Dev","price":9.99,"isbn":"9780000000001","description":"Fast intro to Flask."},
        {"title":"React in a Weekend","author":"B. Hacker","price":12.50,"isbn":"9780000000002","description":"Ship a SPA quickly."},
        {"title":"Payments with M-Pesa","author":"C. Kenya","price":7.00,"isbn":"9780000000003","description":"Daraja basics for devs."}
    ]
    with SessionLocal() as s:
        for d in sample:
            if not s.query(Book).filter_by(isbn=d["isbn"]).first():
                s.add(Book(**d))
        s.commit()
    return {"ok": True}
