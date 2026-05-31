from flask import Blueprint
from app.controllers.estado_controller import EstadoController

estado_bp = Blueprint('estados', __name__)

@estado_bp.route('', methods=['GET'])
def get_estados():
    return EstadoController.get_all_estados()