from flask import request, jsonify
from app.services.animal_service import AnimalService

class AnimalController:
    
    @staticmethod
    def create_animal():

        data = request.get_json()

        if not data:
            return jsonify({"error": "Datos inválidos"}), 400

        required = ["nombre", "tipo", "genero", "tamanio", "fecha_ingreso", "esterilizado", "estados"]
        for field in required:
            if field not in data or data[field] is None:
                return jsonify({"error": f"Falta el campo requerido: {field}"}), 400

        try:
            animal = AnimalService.create_animal(data)
            return jsonify(animal), 201
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except LookupError as e:
            return jsonify({"error": str(e)}), 422
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    @staticmethod
    def get_all_animales():
        tipo = request.args.get("tipo")
        estado_id = request.args.get("estado_id")

        try:
            animales = AnimalService.get_all_animales(tipo=tipo, estado_id=estado_id)
            return jsonify(animales), 200
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except LookupError as e:
            return jsonify({"error": str(e)}), 422
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    @staticmethod
    def get_animal(animal_id):
        try:
            animal = AnimalService.get_animal(animal_id)
            return jsonify(animal), 200
        except LookupError as e:
            return jsonify({"error": str(e)}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500
        
    @staticmethod
    def update_animal(animal_id):
        data = request.get_json()

        if not data:
            return jsonify({"error": "Datos inválidos"}), 400

        try:
            AnimalService.update_animal(animal_id, data)
            return jsonify({"message": "Animal actualizado correctamente."}), 200
        except ValueError as e:
            return jsonify({"error": str(e)}), 400
        except LookupError as e:
            return jsonify({"error": str(e)}), 404 if "Animal" in str(e) else 422
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    @staticmethod
    def delete_animal(animal_id):
        try:
            AnimalService.delete_animal(animal_id)
            return jsonify({"message": "Animal eliminado correctamente."}), 200
        except LookupError as e:
            return jsonify({"error": str(e)}), 404
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    