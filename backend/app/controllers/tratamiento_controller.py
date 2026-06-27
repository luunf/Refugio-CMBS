from flask import request, jsonify
from app.services.tratamiento_service import TratamientoService


def get_tratamientos():
    tratamientos = TratamientoService.get_all()
    return jsonify(tratamientos), 200


def create_tratamiento(visita_id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Datos inválidos"}), 400

    try:
        tratamiento = TratamientoService.create(visita_id, data)
        return jsonify(tratamiento), 201
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        print("Error completo al crear tratamiento:", str(e))
        return jsonify({"error": "Error al crear el tratamiento"}), 500


def update_tratamiento(id):
    data = request.get_json()
    if not data:
        return jsonify({"error": "Datos inválidos"}), 400

    try:
        tratamiento = TratamientoService.update(id, data)
        return jsonify(tratamiento), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Error al actualizar el tratamiento"}), 500


def delete_tratamiento(id):
    try:
        TratamientoService.delete(id)
        return jsonify({"message": "Tratamiento eliminado correctamente"}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        return jsonify({"error": "Error al eliminar el tratamiento"}), 500