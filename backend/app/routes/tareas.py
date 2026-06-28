from flask import Blueprint
from app.controllers.tarea_controller import TareaController
from app.utils.decorators import token_required

tarea_bp = Blueprint('tareas', __name__)

@tarea_bp.route('', methods=['GET'])
@token_required
def get_tareas(decoded_token):
    return TareaController.get_all_tareas()

@tarea_bp.route('/<int:tarea_id>', methods=['GET'])
@token_required
def get_tarea(decoded_token, tarea_id):
    return TareaController.get_tarea(tarea_id)

@tarea_bp.route('', methods=['POST'])
@token_required
def create_tarea(decoded_token):
    return TareaController.create_tarea(decoded_token)

@tarea_bp.route('/desde-tratamiento', methods=['POST'])
@token_required
def create_tareas_desde_tratamiento(decoded_token):
    return TareaController.create_tareas_desde_tratamiento()

@tarea_bp.route('/<int:tarea_id>', methods=['PATCH'])
@token_required
def update_tarea(decoded_token, tarea_id):
    return TareaController.update_tarea(
        tarea_id,
        decoded_token
    )

@tarea_bp.route('/<int:tarea_id>', methods=['DELETE'])
@token_required
def delete_tarea(decoded_token, tarea_id):
    return TareaController.delete_tarea(
        tarea_id,
        decoded_token
    )

@tarea_bp.route('/personas/<int:persona_id>/tareas', methods=['GET'])
@token_required
def tareas_de_persona(decoded_token,persona_id):
    return TareaController.get_tareas_by_persona(persona_id)

@tarea_bp.route('/<int:tarea_id>/personas', methods=['GET'])
@token_required
def personas_de_tarea(decoded_token, tarea_id):
    return TareaController.get_personas_by_tarea(tarea_id)