from flask import jsonify
from app.services.estado_service import EstadoService


class EstadoController:

    @staticmethod
    def get_all_estados():
        try:
            estados = EstadoService.get_all_estados()
            return jsonify(estados), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500