from datetime import datetime

from app.extensions import db
from app.models.tratamiento import Tratamiento


class TratamientoService:

    @staticmethod
    def get_all():
        tratamientos = Tratamiento.query.all()

        return [
            tratamiento.to_dict()
            for tratamiento in tratamientos
        ]

    @staticmethod
    def create(visita_id, data):

        tratamiento = Tratamiento(
            tipo=data["tipo"],
            descripcion=data.get("descripcion"),
            fecha_inicio=datetime.strptime(
                data["fecha_inicio"],
                "%Y-%m-%d"
            ).date(),
            fecha_fin=datetime.strptime(
                data["fecha_fin"],
                "%Y-%m-%d"
            ).date() if data.get("fecha_fin") else None,
            visita_id=visita_id
        )

        db.session.add(tratamiento)
        db.session.commit()

        return tratamiento.to_dict()

    @staticmethod
    def delete(id_tratamiento):

        tratamiento = Tratamiento.query.get_or_404(
            id_tratamiento
        )

        db.session.delete(tratamiento)
        db.session.commit()