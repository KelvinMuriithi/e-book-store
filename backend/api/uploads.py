from flask import Blueprint, request, jsonify
import os uuid

bp= Blueprint('uploads', __name__, url_prefix='/uploads')
UPLOAD_FOLDER = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))

@bp.post('/image')
def upload_image():
    f=request.files.get('image')
    if not f:
        return jsonify({"error": "No file provided"}), 400
    ext = os.path.splitext(f.filename)[1].lower()
    name = f"{uuid.uuid4().hex}{ext}"
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    path = os.path.join(UPLOAD_FOLDER, name)
    f.save(path)
    return jsonify({"url": f"/uploads/{name}"}), 201
