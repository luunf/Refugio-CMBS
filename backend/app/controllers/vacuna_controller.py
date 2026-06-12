from flask import request, jsonify
from app.services.vacuna_service import VacunaService


class VacunaController:

    @staticmethod
    def get_vacunas(animal_id):

        try:
            vacunas = VacunaService.get_vacunas(animal_id)
            return jsonify(vacunas), 200

        except LookupError as e:
            return jsonify({"error": str(e)}), 404

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    @staticmethod
    def create_vacuna(animal_id):

        data = request.get_json()

        if not data:
            return jsonify({"error": "Datos inválidos"}), 400

        if "nombre" not in data or not data["nombre"]:
            return jsonify({"error": "Falta el campo requerido: nombre"}), 400

        try:
            vacuna = VacunaService.create_vacuna(
                animal_id,
                data
            )

            return jsonify({
    "id_vacuna": vacuna.id_vacuna,
    "nombre": vacuna.nombre,
    "fecha_aplicacion":
        str(vacuna.fecha_aplicacion)
        if vacuna.fecha_aplicacion
        else None,
    "requiere_prox_dosis":
        vacuna.requiere_prox_dosis,
    "fecha_prox_dosis":
        str(vacuna.fecha_prox_dosis)
        if vacuna.fecha_prox_dosis
        else None,
    "costo_aplicacion":
        float(vacuna.costo_aplicacion)
        if vacuna.costo_aplicacion is not None
        else None,
    "animal_id":
        vacuna.animal_id
        }), 201

        except ValueError as e:
            return jsonify({"error": str(e)}), 400

        except LookupError as e:
            return jsonify({"error": str(e)}), 404

        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    @staticmethod
    def update_vacuna(vacuna_id):

        data = request.get_json()

        if not data:
            return jsonify({
            "error": "Datos inválidos"
        }), 400

        try:

            VacunaService.update_vacuna(
            vacuna_id,
            data
        )

            return jsonify({
            "message":
            "Vacuna actualizada correctamente."
        }), 200

        except ValueError as e:
            return jsonify({
            "error": str(e)
        }), 400

        except LookupError as e:
            return jsonify({
            "error": str(e)
        }), 404

        except Exception as e:
            return jsonify({
            "error": str(e)
        }), 500

    @staticmethod
    def delete_vacuna(vacuna_id):

        try:

            VacunaService.delete_vacuna(
            vacuna_id
        )

            return jsonify({
            "message":
            "Vacuna eliminada correctamente."
        }), 200

        except LookupError as e:
            return jsonify({
            "error": str(e)
        }), 404

        except Exception as e:
            return jsonify({
            "error": str(e)
        }), 500