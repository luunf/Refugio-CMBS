from flask import Blueprint
from app.controllers.visita_controller import VisitaController
from app.controllers.tratamiento_controller import create_tratamiento

visita_bp = Blueprint('visitas', __name__)

@visita_bp.route('/<int:visita_id>/tratamientos', methods=['POST'])
def create_tratamiento_visita(visita_id):
    return create_tratamiento(visita_id)

@visita_bp.route('/<int:visita_id>', methods=['GET'])
def get_visita(visita_id):
    return VisitaController.get_visita(visita_id)

@visita_bp.route('/<int:visita_id>', methods=['PATCH'])
def update_visita(visita_id):
    return VisitaController.update_visita(visita_id)

@visita_bp.route('/<int:visita_id>', methods=['DELETE'])
def delete_visita(visita_id):
    return VisitaController.delete_visita(visita_id)
