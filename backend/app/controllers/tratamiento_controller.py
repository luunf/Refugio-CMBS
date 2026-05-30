from flask import request, jsonify

from app.services.tratamiento_service import TratamientoService


class TratamientoController:

    @staticmethod
    def get_all():

        tratamientos = TratamientoService.get_all()

        return jsonify(tratamientos), 200

    @staticmethod
    def create(visita_id):

        data = request.get_json()

        tratamiento = TratamientoService.create(
            visita_id,
            data
        )

        return jsonify(tratamiento), 201

    @staticmethod
    def delete(id_tratamiento):

        TratamientoService.delete(
            id_tratamiento
        )

        return jsonify({
            "message": "Tratamiento eliminado"
        }), 200