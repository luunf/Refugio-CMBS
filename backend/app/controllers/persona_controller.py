from flask import request, jsonify
from app.services.persona_service import PersonaService


class PersonaController:

    @staticmethod
    def get_all_personas():

        rol = request.args.get("rol")

        try:

            personas = PersonaService.get_all_personas(rol)

            return jsonify(personas), 200

        except Exception as e:

            return jsonify({
                "error": str(e)
            }), 500

    @staticmethod
    def get_persona(persona_id):

        try:

            persona = PersonaService.get_persona_by_id(
                persona_id
            )

            if not persona:

                return jsonify({
                    "error": "Persona no encontrada"
                }), 404

            return jsonify(persona), 200

        except Exception as e:

            return jsonify({
                "error": str(e)
            }), 500

    @staticmethod
    def get_personas_by_animal(animal_id):

        try:

            personas = PersonaService.get_personas_by_animal(
                animal_id
            )

            return jsonify(personas), 200

        except Exception as e:

            if "no encontrado" in str(e):

                return jsonify({
                    "error": str(e)
                }), 404

            return jsonify({
                "error": str(e)
            }), 500

    @staticmethod
    def create_persona():

        data = request.get_json()

        if not data:

            return jsonify({
                "error": "Datos inválidos"
            }), 400

        required = [
            "nombre",
            "apellido"
        ]

        for field in required:

            if field not in data:

                return jsonify({
                    "error": f"Falta el campo requerido: {field}"
                }), 400

        try:

            PersonaService.crear_persona(data)

            return jsonify({
                "message": "Persona registrada correctamente"
            }), 201

        except Exception as e:

            return jsonify({
                "error": str(e)
            }), 400

    @staticmethod
    def update_persona(persona_id):

        data = request.get_json()

        if not data:

            return jsonify({
                "error": "Datos inválidos"
            }), 400

        try:

            PersonaService.actualizar_persona(
                persona_id,
                data
            )

            return jsonify({
                "message": "Persona actualizada correctamente"
            }), 200

        except Exception as e:

            if "no encontrada" in str(e):

                return jsonify({
                    "error": str(e)
                }), 404

            return jsonify({
                "error": str(e)
            }), 400

    @staticmethod
    def delete_persona(persona_id):

        try:

            PersonaService.eliminar_persona(
                persona_id
            )

            return jsonify({
                "message": "Persona eliminada correctamente"
            }), 200

        except Exception as e:

            if "no encontrada" in str(e):

                return jsonify({
                    "error": str(e)
                }), 404

            return jsonify({
                "error": str(e)
            }), 500