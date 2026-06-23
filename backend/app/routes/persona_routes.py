from flask import Blueprint
from app.controllers.persona_controller import PersonaController
from app.utils.decorators import token_required

persona_bp = Blueprint('personas', __name__)

@persona_bp.route('', methods=['GET'])
def get_personas():
    return PersonaController.get_all_personas()

@persona_bp.route('/<int:persona_id>', methods=['GET'])
def get_persona(persona_id):
    return PersonaController.get_persona(persona_id)

@persona_bp.route('', methods=['POST'])
def create_persona():
    return PersonaController.create_persona()

@persona_bp.route('/<int:persona_id>', methods=['PATCH'])
def update_persona(persona_id):
    return PersonaController.update_persona(persona_id)

@persona_bp.route('/<int:persona_id>', methods=['DELETE'])
def delete_persona(persona_id):
    return PersonaController.delete_persona(persona_id)

@persona_bp.route('/buscar-por-email', methods=['GET'])
def buscar_persona_por_email():
    return PersonaController.buscar_por_email()