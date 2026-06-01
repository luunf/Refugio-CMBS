from flask import Blueprint
from app.controllers.visita_controller import VisitaController
from app.controllers.tratamiento_controller import create_tratamiento

visita_bp = Blueprint('visitas', __name__)

# Visitas de un animal
visita_bp.route('/animales/<int:animal_id>/visitas', methods=['GET'])
visita_bp.route('/animales/<int:animal_id>/visitas', methods=['POST'])
# Tratamientos de una visita
visita_bp.route('/visitas/<int:visita_id>/tratamientos', methods=['POST'])