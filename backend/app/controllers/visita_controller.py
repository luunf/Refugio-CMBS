from flask import request, jsonify
from app.services.visita_service import VisitaService


class VisitaController:

    @staticmethod
    def get_visitas(animal_id):
        try:
            visitas = VisitaService.get_visitas(animal_id)
            return jsonify(visitas), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def create_visita(animal_id):
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos inválidos"}), 400
        try:
            visita = VisitaService.create_visita(animal_id, data)
            return jsonify(visita.to_dict()), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 500