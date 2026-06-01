from datetime import datetime
from app.extensions import db
from app.models.visita_veterinaria import VisitaVeterinaria


class VisitaService:

    @staticmethod
    def get_visitas(animal_id):
        visitas = VisitaVeterinaria.query.filter_by(animal_id=animal_id).all()
        return [v.to_dict() for v in visitas]

    @staticmethod
    def create_visita(animal_id, data):
        visita = VisitaVeterinaria(
            fecha=datetime.strptime(data["fecha"], "%Y-%m-%d").date(),
            estado=data.get("estado", "realizada"),
            procedimiento=data["procedimiento"],
            info_adicional=data.get("info_adicional"),
            costo=data.get("costo"),
            animal_id=animal_id,
            veterinario_id=data["veterinario_id"],
        )
        db.session.add(visita)
        db.session.commit()
        return visita