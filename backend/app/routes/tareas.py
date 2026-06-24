from flask import Blueprint
from app.controllers.tarea_controller import TareaController
from app.utils.decorators import token_required

tarea_bp = Blueprint('tareas', __name__)

@tarea_bp.route('', methods=['GET'])
def get_tareas():
    return TareaController.get_all_tareas()

@tarea_bp.route('/<int:tarea_id>', methods=['GET'])
def get_tarea(tarea_id):
    return TareaController.get_tarea(tarea_id)

@tarea_bp.route('', methods=['POST'])
@token_required
def create_tarea(decoded_token):
    return TareaController.create_tarea(decoded_token)

@tarea_bp.route('/desde-tratamiento', methods=['POST'])
def create_tareas_desde_tratamiento():
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
def tareas_de_persona(persona_id):
    return TareaController.get_tareas_by_persona(persona_id)

@tarea_bp.route('/<int:tarea_id>/personas', methods=['GET'])
def personas_de_tarea(tarea_id):
    return TareaController.get_personas_by_tarea(tarea_id)