from flask import Blueprint
from app.controllers.animal_controller import AnimalController

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