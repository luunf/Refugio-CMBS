from flask import jsonify
from app.services.compatibilidad_service import CompatibilidadService


class CompatibilidadController:

    @staticmethod
    def get_all_compatibilidades():
        try:
            compatibilidades = CompatibilidadService.get_all_compatibilidades()
            return jsonify(compatibilidades), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500