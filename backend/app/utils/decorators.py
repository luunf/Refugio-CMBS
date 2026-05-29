from functools import wraps
from flask import request, jsonify, current_app
from app.services.firebase_service import FirebaseService

def token_required(f):

    @wraps(f)
    def decorated(*args, **kwargs):

        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return jsonify({
                "error": "Token no proporcionado"
            }), 401

        parts = auth_header.split()

        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return jsonify({
                "error": "Formato de token inválido. Use 'Bearer <token>'"
            }), 401

        token = parts[1]

        print("TOKEN")
        print(token)

        decoded_token = FirebaseService.verify_token(token)

        print("DECODED TOKEN")
        print(decoded_token)

        if not decoded_token:
            return jsonify({
                "error": "Token inválido o expirado"
            }), 401

        # Agregar el token decodificado
        kwargs['decoded_token'] = decoded_token

        return f(*args, **kwargs)

    return decorated