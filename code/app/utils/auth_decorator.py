from functools import wraps
from flask import request, jsonify, g
from app.services.firebase_service import verify_id_token

def auth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get("Authorization", None)
        if not auth_header or not auth_header.startswith("Bearer "):
            return jsonify({"message": "Missing or invalid Authorization header"}), 401

        id_token = auth_header.split("Bearer ")[1]
        decoded_token = verify_id_token(id_token)

        if not decoded_token:
            return jsonify({"message": "Invalid or expired token"}), 401

        g.user = decoded_token  # збережемо користувача в g
        return f(*args, **kwargs)
    return decorated_function
