from flask import Blueprint
from app.controllers.vacuna_controller import VacunaController

vacuna_bp = Blueprint('vacunas', __name__)

@vacuna_bp.route('/animales/<int:animal_id>', methods=['GET'])
def get_vacunas(animal_id):
    return VacunaController.get_vacunas(animal_id)

@vacuna_bp.route('/animales/<int:animal_id>', methods=['POST'])
def create_vacuna(animal_id):
    return VacunaController.create_vacuna(animal_id)

@vacuna_bp.route('/<int:vacuna_id>', methods=['PATCH'])
def update_vacuna(vacuna_id):
    return VacunaController.update_vacuna(
        vacuna_id
    )

@vacuna_bp.route('/<int:vacuna_id>', methods=['DELETE'])
def delete_vacuna(vacuna_id):
    return VacunaController.delete_vacuna(
        vacuna_id
    )