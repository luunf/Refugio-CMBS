from flask import Blueprint
from app.controllers.animal_controller import AnimalController
from app.controllers.visita_controller import VisitaController
from app.controllers.vacuna_controller import VacunaController
from app.controllers.historial_estado_controller import HistorialEstadoController

animal_bp = Blueprint('animales', __name__)

@animal_bp.route('', methods=['GET'])
def get_animales():
    return AnimalController.get_all_animales()

@animal_bp.route('/<int:animal_id>', methods=['GET'])
def get_animal(animal_id):
    return AnimalController.get_animal(animal_id)

@animal_bp.route('', methods=['POST'])
def create_animal():
    return AnimalController.create_animal()

@animal_bp.route('/<int:animal_id>', methods=['PATCH'])
def update_animal(animal_id):
    return AnimalController.update_animal(animal_id)

@animal_bp.route('/<int:animal_id>', methods=['DELETE'])
def delete_animal(animal_id):
    return AnimalController.delete_animal(animal_id)

#endpoints para poder crerar un tratameinto
@animal_bp.route('/<int:animal_id>/visitas', methods=['GET'])
def get_visitas_animal(animal_id):
    return VisitaController.get_visitas(animal_id)

@animal_bp.route('/<int:animal_id>/visitas', methods=['POST'])
def create_visita_animal(animal_id):
    return VisitaController.create_visita(animal_id)

@animal_bp.route('/<int:animal_id>/vacunas', methods=['GET'])
def get_vacunas_animal(animal_id):
    return VacunaController.get_vacunas(animal_id)

@animal_bp.route('/<int:animal_id>/vacunas', methods=['POST'])
def create_vacuna_animal(animal_id):
    return VacunaController.create_vacuna(animal_id)

@animal_bp.route('/<int:animal_id>/historial-estados', methods=['GET'])
def get_historial_animal(animal_id):
    return HistorialEstadoController.get_historial(animal_id)

@animal_bp.route('/<int:animal_id>/historial-estados', methods=['POST'])
def create_historial_animal(animal_id):
    return HistorialEstadoController.create_registro_historial(animal_id)