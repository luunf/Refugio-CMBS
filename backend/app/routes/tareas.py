from flask import Blueprint
from app.controllers.tarea_controller import TareaController

tarea_bp = Blueprint('tareas', __name__)

@tarea_bp.route('', methods=['GET'])
def get_tareas():
    return TareaController.get_all_tareas()

@tarea_bp.route('/<int:tarea_id>', methods=['GET'])
def get_tarea(tarea_id):
    return TareaController.get_tarea(tarea_id)

@tarea_bp.route('', methods=['POST'])
def create_tarea():
    return TareaController.create_tarea()

@tarea_bp.route('/<int:tarea_id>', methods=['PATCH'])
def update_tarea(tarea_id):
    return TareaController.update_tarea(tarea_id)

@tarea_bp.route('/<int:tarea_id>', methods=['DELETE'])
def delete_tarea(tarea_id):
    return TareaController.delete_tarea(tarea_id)

@tarea_bp.route('/personas/<int:persona_id>/tareas', methods=['GET'])
def tareas_de_persona(persona_id):
    return TareaController.get_tareas_by_persona(persona_id)

@tarea_bp.route('/<int:tarea_id>/personas', methods=['GET'])
def personas_de_tarea(tarea_id):
    return TareaController.get_personas_by_tarea(tarea_id)