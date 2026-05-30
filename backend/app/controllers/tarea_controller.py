from flask import request, jsonify
from app.services.tarea_service import TareaService


class TareaController:

    @staticmethod
    def get_all_tareas():
        mes = request.args.get("mes")
        year = request.args.get("year")
        try:
            tareas = TareaService.get_all_tareas(mes, year)
            return jsonify(tareas), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def get_tarea(tarea_id):
        try:
            tarea = TareaService.get_tarea_by_id(tarea_id)
            return jsonify(tarea), 200
        except Exception as e:
            if "no encontrada" in str(e):
                return jsonify({"error": str(e)}), 404
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def create_tarea():
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos inválidos"}), 400
        required = ["nombre", "fecha"]
        for field in required:
            if field not in data:
                return jsonify({"error": f"Falta el campo requerido: {field}"}), 400
        try:
            tarea = TareaService.crear_tarea(data)
            return jsonify(tarea), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    @staticmethod
    def update_tarea(tarea_id):
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos inválidos"}), 400
        try:
            tarea = TareaService.actualizar_tarea(tarea_id, data)
            return jsonify(tarea), 200
        except Exception as e:
            if "no encontrada" in str(e):
                return jsonify({"error": str(e)}), 404
            return jsonify({"error": str(e)}), 400

    @staticmethod
    def delete_tarea(tarea_id):
        try:
            TareaService.eliminar_tarea(tarea_id)
            return jsonify({"message": "Tarea eliminada correctamente"}), 200
        except Exception as e:
            if "no encontrada" in str(e):
                return jsonify({"error": str(e)}), 404
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def get_personas_by_tarea(tarea_id):
        try:
            personas = TareaService.get_personas_by_tarea(tarea_id)
            return jsonify(personas), 200
        except Exception as e:
            if "no encontrada" in str(e):
                return jsonify({"error": str(e)}), 404
            return jsonify({"error": str(e)}), 500

##ver si este es el endpoit que va en personal controller       
    @staticmethod
    def get_tareas_by_persona(persona_id):
        try:
            tareas = TareaService.get_tareas_by_persona(persona_id)
            return jsonify(tareas), 200
        except Exception as e:
            if "no encontrada" in str(e):
                return jsonify({"error": str(e)}), 404
            return jsonify({"error": str(e)}), 500
