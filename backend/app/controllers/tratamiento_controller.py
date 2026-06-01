from flask import request, jsonify
from app.services.tratamiento_service import TratamientoService


def get_tratamientos():
    tratamientos = TratamientoService.get_all()
    return jsonify(tratamientos), 200


def create_tratamiento(visita_id):
    data = request.get_json()
    tratamiento = TratamientoService.create(visita_id, data)
    return jsonify(tratamiento), 201


def update_tratamiento(id):
    data = request.get_json()
    tratamiento = TratamientoService.update(id, data)
    return jsonify(tratamiento), 200


def delete_tratamiento(id):
    TratamientoService.delete(id)
    return jsonify({"message": "Tratamiento eliminado"}), 200