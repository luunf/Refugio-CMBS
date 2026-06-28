# app/routes/tratamiento_routes.py 
from flask import Blueprint, jsonify
from app.controllers.tratamiento_controller import (
    get_tratamientos,
    update_tratamiento,
    delete_tratamiento,
)
from app.utils.decorators import token_required
from app.services.usuario_service import UsuarioService

tratamiento_bp = Blueprint('tratamientos', __name__)

@tratamiento_bp.route('', methods=['GET'])
@token_required
def get_tratamientos_route(decoded_token):
    return get_tratamientos()

@tratamiento_bp.route('/<int:id>', methods=['PATCH'])
@token_required
def update_tratamiento_route(decoded_token, id):
    try:
        return update_tratamiento(id)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@tratamiento_bp.route('/<int:id>', methods=['DELETE'])
@token_required
def delete_tratamiento_route(decoded_token, id):
    try:
        return delete_tratamiento(id)
    except Exception as e:
        return jsonify({"error": str(e)}), 500