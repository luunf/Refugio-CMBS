from flask import Blueprint
from app.controllers.persona_controller import PersonaController
from app.utils.decorators import token_required

persona_bp = Blueprint('personas', __name__)

@persona_bp.route('', methods=['GET'])
@token_required
def get_personas(decoded_token):
    return PersonaController.get_all_personas()

@persona_bp.route('/<int:persona_id>', methods=['GET'])
@token_required
def get_persona(decoded_token, persona_id):
    return PersonaController.get_persona(persona_id)

@persona_bp.route('', methods=['POST'])
@token_required
def create_persona(decoded_token):
    return PersonaController.create_persona()

@persona_bp.route('/<int:persona_id>', methods=['PATCH'])
@token_required
def update_persona(decoded_token, persona_id):
    return PersonaController.update_persona(persona_id)

@persona_bp.route('/<int:persona_id>', methods=['DELETE'])
@token_required
def delete_persona(decoded_token, persona_id):
    return PersonaController.delete_persona(persona_id)

@persona_bp.route('/buscar-por-email', methods=['GET'])
@token_required
def buscar_persona_por_email(decoded_token):
    return PersonaController.buscar_por_email()