from datetime import datetime
from app.extensions import db
from app.models.vacuna import Vacuna
from app.models.animal import Animal


class VacunaService:

    @staticmethod
    def get_vacunas(animal_id):

        animal = Animal.query.get(animal_id)

        if not animal:
            raise LookupError(
                f"Animal con id {animal_id} no encontrado"
            )

        vacunas = Vacuna.query.filter_by(
            animal_id=animal_id
        ).all()

        return [
            {
                "id_vacuna": v.id_vacuna,
                "nombre": v.nombre,
                "fecha_aplicacion":
                    str(v.fecha_aplicacion)
                    if v.fecha_aplicacion
                    else None,
                "requiere_prox_dosis":
                    v.requiere_prox_dosis,
                "fecha_prox_dosis":
                    str(v.fecha_prox_dosis)
                    if v.fecha_prox_dosis
                    else None,
                "costo_aplicacion":
                    float(v.costo_aplicacion)
                    if v.costo_aplicacion is not None
                    else None
            }
            for v in vacunas
        ]
    
    @staticmethod
    def create_vacuna(animal_id, data):

        animal = Animal.query.get(animal_id)

        if not animal:
            raise LookupError(
            f"Animal con id {animal_id} no encontrado"
        )

        vacuna = Vacuna(
            nombre=data["nombre"],
            fecha_aplicacion=
                datetime.strptime(
                    data["fecha_aplicacion"],
                    "%Y-%m-%d"
                ).date()
                if data.get("fecha_aplicacion")
                else None,

            requiere_prox_dosis=
                data.get(
                    "requiere_prox_dosis",
                    False
                ),

            fecha_prox_dosis=
                datetime.strptime(
                    data["fecha_prox_dosis"],
                    "%Y-%m-%d"
                ).date()
                if data.get("fecha_prox_dosis")
                else None,

            costo_aplicacion=
                data.get("costo_aplicacion"),

            animal_id=animal_id
    )

        db.session.add(vacuna)
        db.session.commit()

        return vacuna