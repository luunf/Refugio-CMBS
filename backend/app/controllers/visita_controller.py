from flask import request, jsonify
from app.services.visita_service import VisitaService
from app.services.usuario_service import UsuarioService


class VisitaController:

    @staticmethod
    def get_visitas(animal_id):
        estado = request.args.get("estado")
        try:
            visitas = VisitaService.get_visitas(animal_id, estado=estado)
            return jsonify(visitas), 200
        except LookupError as e:
            return jsonify({"error": str(e)}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def create_visita(animal_id):
        data = request.get_json()

        if not data:
            return jsonify({"error": "Datos inválidos"}), 400

        required = ["fecha", "procedimiento", "estado", "veterinario_id"]
        for field in required:
            if field not in data or data[field] is None:
                return jsonify({"error": f"Falta el campo requerido: {field}"}), 400
        
        try:
            visita, tarea = VisitaService.create_visita(animal_id, data)
            respuesta = visita.to_dict()
            respuesta["tarea_creada"] = tarea is not None
            respuesta["tarea_nombre"] = tarea.nombre if tarea else None
            return jsonify(respuesta), 201
        except LookupError as e:
            return jsonify({"error": str(e)}), 404
        except ValueError as e:
            return jsonify({"error": str(e)}), 422
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    @staticmethod
    def get_visita(visita_id):
        try:
            visita = VisitaService.get_visita(visita_id)
            return jsonify(visita), 200
        except LookupError as e:
            return jsonify({"error": str(e)}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    @staticmethod
    def update_visita(visita_id, decoded_token):
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos inválidos"}), 400

        try:
            nombre_usuario = VisitaController._obtener_nombre_usuario(decoded_token)
            respuesta = VisitaService.update_visita(visita_id, data, actualizado_por=nombre_usuario)
            return jsonify(respuesta), 200
        except LookupError as e:
            return jsonify({"error": str(e)}), 404
        except ValueError as e:
            return jsonify({"error": str(e)}), 422
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def delete_visita(visita_id):
        try:
            VisitaService.delete_visita(visita_id)
            return jsonify({"message": "Visita eliminada correctamente."}), 200
        except LookupError as e:
            return jsonify({"error": str(e)}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    @staticmethod
    def _obtener_nombre_usuario(decoded_token):

        firebase_uid = decoded_token.get("uid")

        usuario = UsuarioService.get_usuario_by_firebase_uid(
            firebase_uid
        )

        if not usuario:
            return "Sistema"

        return (
            f"{usuario.persona.nombre} "
            f"{usuario.persona.apellido}"
        )