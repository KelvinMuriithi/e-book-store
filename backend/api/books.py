from flask import Blueprint, jsonify, request, abort
from sqlalchemy import or_, desc, asc
from db import SessionLocal
from models.book import Book
from models.user import UserRole
from auth import require_role, get_current_user

bp = Blueprint("books", __name__, url_prefix="/api/books")

def row_to_dict(book):
    return {
        "id": book.id,
        "title": book.title,
        "author": book.author,
        "description": book.description,
        "price": book.price,
        "isbn": book.isbn,
        "cover_image": book.cover_image,
    }
@bp.route("", methods=["GET"])
@bp.route("/", methods=["GET"])
def list_books():
    q = request.args.get("q", "").strip()
    sort = request.args.get("sort", "new")
    # Robust numbers
    try:
        page = int(request.args.get("page", 1) or 1)
    except ValueError:
        page = 1
    try:
        per_page = int(request.args.get("per_page", 12) or 12)
    except ValueError:
        per_page = 12
    per_page = max(1, min(per_page, 50))  # never 0

    with SessionLocal() as s:
        query = s.query(Book)

        if q:
            like = f"%{q}%"
            query = query.filter(
                or_(Book.title.ilike(like),
                    Book.author.ilike(like),
                    Book.description.ilike(like))
            )

        if sort == "price_asc":
            query = query.order_by(asc(Book.price))
        elif sort == "price_desc":
            query = query.order_by(desc(Book.price))
        elif sort == "title":
            query = query.order_by(asc(Book.title))
        else:
            query = query.order_by(desc(Book.id))  # newest

        total = query.count()
        offset = (page - 1) * per_page
        items = query.offset(offset).limit(per_page).all()

        # DEBUG prints
        # print(f"[books] q='{q}' sort='{sort}' page={page} per_page={per_page} total={total} offset={offset} returned={len(items)}")
        # print("[books] ids:", [b.id for b in items])

        return jsonify({
            "items": [row_to_dict(b) for b in items],
            "page": page,
            "per_page": per_page,
            "total": total
        })

        
@bp.route("/<int:book_id>", methods=["GET"])
def get_book(book_id):
    with SessionLocal() as session:
        book = session.get(Book, book_id)
        if not book:
            abort(404, description="Book not found")
        return jsonify(row_to_dict(book))
    
@bp.route("", methods=["POST"])
@require_role(UserRole.author, UserRole.admin)
def create_book():
    data = request.get_json(force=True)
    required_fields = ["title", "author", "price", "isbn"]
    if any(field not in data for field in required_fields):
        abort(400, description="Missing required fields")
    with SessionLocal() as session:
        book = Book(
            title=data["title"].strip(),
            author=data["author"].strip(),
            description=data.get("description"),
            price=float(data["price"]),
            isbn=data["isbn"].strip(),
            cover_image=data.get("cover_image"),
        )
        session.add(book)
        session.commit()
        session.refresh(book)
        return jsonify(row_to_dict(book)), 201
    
    
@bp.route("/<int:book_id>", methods=["PATCH"])
@require_role(UserRole.author, UserRole.admin)
def update_book(book_id):
    data = request.get_json(force=True, silent=False)
    if data is None:
        return {"error": "Invalid JSON data"}, 400
    with SessionLocal() as session:
        book = session.get(Book, book_id)
        if not book:
            abort(404, description="Book not found")
        
        for field in ["title", "author", "description", "price", "isbn", "cover_image"]:
            if field in data:
                val = data[field]
                if isinstance(val, str):
                    val = val.strip()
                if field == "price" and val is not None:
                    try:
                        val = float(val)
                    except ValueError:
                        return {"error": "Price must be a number"}, 400
                setattr(book, field, val)
        
        try:
            session.commit()
        except IntegrityError as e:
            session.rollback()
            return {"error" :"ISBN already exists"}, 409
        return jsonify(row_to_dict(book)), 200
    
@bp.route("/<int:book_id>", methods=["DELETE"])
@require_role(UserRole.author, UserRole.admin)
def delete_book(book_id):
    with SessionLocal() as session:
        book = session.get(Book, book_id)
        if not book:
            abort(404, description="Book not found")
        session.delete(book); session.commit()
        return jsonify(message="Book deleted"), 200
    
