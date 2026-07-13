from flask import request, jsonify
from app.services.historial_estado_service import HistorialEstadoService


class HistorialEstadoController:

    @staticmethod
    def get_historial(animal_id):
        try:
            historial = HistorialEstadoService.get_historial(animal_id)
            return jsonify(historial), 200
        except LookupError as e:
            return jsonify({"error": str(e)}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def create_registro_historial(animal_id):
        data = request.get_json()

        if not data:
            return jsonify({"error": "Datos inválidos"}), 400

        try:
            registro = HistorialEstadoService.create_registro_historial(animal_id, data)
            return jsonify(registro), 201
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except LookupError as e:
            return jsonify({"error": str(e)}), 404 if "Animal" in str(e) else 422
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def update_registro_historial(historial_id):
        data = request.get_json()

        if not data:
            return jsonify({"error": "Datos inválidos"}), 400

        try:
            registro = HistorialEstadoService.update_registro_historial(historial_id, data)
            return jsonify(registro), 200
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except LookupError as e:
            return jsonify({"error": str(e)}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def delete_registro_historial(historial_id):
        try:
            HistorialEstadoService.delete_registro_historial(historial_id)
            return jsonify({"message": "Registro de historial eliminado correctamente."}), 200
        except LookupError as e:
            return jsonify({"error": str(e)}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500