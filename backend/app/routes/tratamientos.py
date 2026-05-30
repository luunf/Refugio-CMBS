from flask import Blueprint
from app.controllers.tratamiento_controller import get_tratamientos, update_tratamiento, delete_tratamiento

tratamiento_bp = Blueprint('tratamientos', __name__)

tratamiento_bp.route('/', methods=['GET'])(get_tratamientos)
tratamiento_bp.route('/<int:id>', methods=['PATCH'])(update_tratamiento)
tratamiento_bp.route('/<int:id>', methods=['DELETE'])(delete_tratamiento)