from flask import Blueprint
from app.controllers.compatibilidad_controller import CompatibilidadController

compatibilidad_bp = Blueprint('compatibilidades', __name__)

@compatibilidad_bp.route('', methods=['GET'])
def get_compatibilidades():
    return CompatibilidadController.get_all_compatibilidades()