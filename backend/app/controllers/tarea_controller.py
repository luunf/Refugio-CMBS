from flask import request, jsonify
from app.services.tarea_service import TareaService
from datetime import datetime
from app.services.usuario_service import UsuarioService

class TareaController:

    @staticmethod
    def _validar_fecha(fecha_str: str) -> bool:
        try:
            datetime.strptime(fecha_str, "%Y-%m-%d")
            return True
        except:
            return False

    @staticmethod
    def _validar_hora(hora_str: str) -> bool:
        if not hora_str:
            return True
        try:
            datetime.strptime(hora_str, "%H:%M")
            return True
        except:
            return False

    @staticmethod
    def _validar_nombre(nombre: str) -> bool:
        if not nombre or not isinstance(nombre, str):
            return False
        nombre_limpio = nombre.strip()
        return len(nombre_limpio) >= 3 and not nombre_limpio.isdigit()

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
        except ValueError as e:
            return jsonify({"error": str(e)}), 404
        except Exception as e:
            return jsonify({"error": "Error interno"}), 500

    @staticmethod
    def create_tarea(decoded_token):
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos inválidos"}), 400

        if not TareaController._validar_nombre(data.get("nombre")):
            return jsonify({"error": "El nombre debe tener al menos 3 caracteres y no puede ser solo números"}), 400

        if not data.get("fecha") or not TareaController._validar_fecha(data.get("fecha")):
            return jsonify({"error": "Fecha inválida. Formato: YYYY-MM-DD"}), 400

        es_todo_el_dia = data.get("es_todo_el_dia", False)
        hora = data.get("hora")

        if not es_todo_el_dia and not hora:
            return jsonify({"error": "Debes especificar una hora para una tarea puntual"}), 400

        if hora and not TareaController._validar_hora(hora):
            return jsonify({"error": "Hora inválida. Formato: HH:MM"}), 400

        if "personas_ids" in data and not isinstance(data.get("personas_ids"), list):
            return jsonify({"error": "'personas_ids' debe ser una lista de números"}), 400

        try:

            nombre_usuario = (
                TareaController._obtener_nombre_usuario(
                    decoded_token
                )
            )

            tarea = TareaService.crear_tarea(
                data,
                asignado_por=nombre_usuario
            )

            return jsonify(tarea), 201

        except Exception as e:
            return jsonify({"error": str(e)}), 400

    @staticmethod
    def create_tareas_desde_tratamiento():
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos inválidos"}), 400

        if not TareaController._validar_nombre(data.get("nombre")):
            return jsonify({"error": "El nombre debe tener al menos 3 caracteres y no puede ser solo números"}), 400

        if not data.get("fecha_inicio") or not TareaController._validar_fecha(data.get("fecha_inicio")):
            return jsonify({"error": "fecha_inicio inválida"}), 400

        try:
            tareas = TareaService.crear_tareas_desde_tratamiento(
                nombre=data["nombre"],
                fecha_inicio=data["fecha_inicio"],
                fecha_fin=data.get("fecha_fin"),
                descripcion=data.get("descripcion"),
                tratamiento_id=data.get("tratamiento_id")
            )
            return jsonify(tareas), 201
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    @staticmethod
    def update_tarea(tarea_id, decoded_token):
        data = request.get_json()
        if not data:
            return jsonify({"error": "Datos inválidos"}), 400

        # Validar nombre solo si viene en el update
        if "nombre" in data and not TareaController._validar_nombre(data.get("nombre")):
            return jsonify({"error": "El nombre debe tener al menos 3 caracteres y no puede ser solo números"}), 400

        if "es_todo_el_dia" in data or "hora" in data:
            es_todo_el_dia = data.get("es_todo_el_dia", False)
            hora = data.get("hora")
            
            if not es_todo_el_dia and not hora:
                return jsonify({"error": "Debes especificar una hora para una tarea puntual"}), 400
            
            if hora and not TareaController._validar_hora(hora):
                return jsonify({"error": "Hora inválida. Formato: HH:MM"}), 400

        allowed = {"nombre", "fecha", "hora", "es_todo_el_dia", "completada", "personas_ids", "descripcion"}
        if any(key not in allowed for key in data.keys()):
            return jsonify({"error": "Campos no permitidos"}), 400

        try:
            nombre_usuario = (
                TareaController._obtener_nombre_usuario(
                    decoded_token
                )
            )

            tarea = TareaService.actualizar_tarea(tarea_id, data, actualizado_por=nombre_usuario)
            return jsonify(tarea), 200
        except ValueError as e:
            return jsonify({"error": str(e)}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 400

    @staticmethod
    def delete_tarea(tarea_id, decoded_token):
        try:
            nombre_usuario = (
                TareaController._obtener_nombre_usuario(
                    decoded_token
                )
            )

            TareaService.eliminar_tarea(
                tarea_id,
                cancelada_por=nombre_usuario
            )
            return jsonify({"message": "Tarea cancelada correctamente"}), 200
        except ValueError as e:
            return jsonify({"error": str(e)}), 404
        except Exception as e:
            return jsonify({"error": "Error interno"}), 500

    @staticmethod
    def get_personas_by_tarea(tarea_id):
        try:
            personas = TareaService.get_personas_by_tarea(tarea_id)
            return jsonify(personas), 200
        except ValueError as e:
            return jsonify({"error": str(e)}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def get_tareas_by_persona(persona_id):
        try:
            tareas = TareaService.get_tareas_by_persona(persona_id)
            return jsonify(tareas), 200
        except ValueError as e:
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