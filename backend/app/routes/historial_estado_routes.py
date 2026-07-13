from flask import Blueprint
from app.controllers.historial_estado_controller import HistorialEstadoController

historial_estado_bp = Blueprint('historial_estados', __name__)

@historial_estado_bp.route('/<int:historial_id>', methods=['PATCH'])
def update_historial(historial_id):
    return HistorialEstadoController.update_registro_historial(historial_id)

@historial_estado_bp.route('/<int:historial_id>', methods=['DELETE'])
def delete_historial(historial_id):
    return HistorialEstadoController.delete_registro_historial(historial_id)