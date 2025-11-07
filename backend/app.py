# app.py
import os
from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
# If you ever need create_all for a one-off local bootstrap, you can
# temporarily uncomment the two lines below.
# from models.base import Base
# from db import engine
from api.books import bp as books_bp
from api.dev import bp as dev_bp
from db import engine

def create_app() -> Flask:
    app = Flask(__name__)
    app.config.update(
        JSON_AS_ASCII=False,
    )

    # CORS: wide-open for dev; tighten origins/headers before prod
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Prefix your blueprint so routes live under /api/books/...
    app.register_blueprint(books_bp, url_prefix="/api/books")
    app.register_blueprint(dev_bp) 
    
    UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), "uploads"))
    @app.route("/uploads/<path:filename>")
    def uploaded_file(filename):
        return send_from_directory(UPLOAD_FOLDER, filename)

    @app.get("/api/health")
    def health():
        return jsonify(status="ok")

    return app


app = create_app()

if __name__ == "__main__":
    # NOTE: Because you're using Alembic, you generally should NOT call create_all().
    # If you absolutely need to bootstrap a fresh local DB once, uncomment:
    #
    # from db import engine
    from models.base import Base
    with engine.begin() as conn:
        Base.metadata.create_all(bind=conn)
    #
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", 5000)), debug=True)
