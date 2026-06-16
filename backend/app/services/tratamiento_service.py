from datetime import datetime
from app.extensions import db
from app.models.tratamiento import Tratamiento


class TratamientoService:

    @staticmethod
    def get_all():
        tratamientos = Tratamiento.query.order_by(Tratamiento.fecha_fin.desc()).all()
        return [t.to_dict() for t in tratamientos]

    @staticmethod
    def create(visita_id, data):
        tratamiento = Tratamiento(
            tipo=data["tipo"],
            descripcion=data.get("descripcion"),
            fecha_inicio=datetime.strptime(data["fecha_inicio"], "%Y-%m-%d").date(),
            fecha_fin=datetime.strptime(data["fecha_fin"], "%Y-%m-%d").date()
                if data.get("fecha_fin") else None,
            visita_id=visita_id
        )
        db.session.add(tratamiento)
        db.session.commit()
        return tratamiento.to_dict()

    @staticmethod
    def update(id_tratamiento, data):
        tratamiento = Tratamiento.query.get_or_404(id_tratamiento)
        if "tipo" in data:
            tratamiento.tipo = data["tipo"]
        if "descripcion" in data:
            tratamiento.descripcion = data["descripcion"]
        if "fecha_inicio" in data:
            tratamiento.fecha_inicio = datetime.strptime(data["fecha_inicio"], "%Y-%m-%d").date()
        if "fecha_fin" in data:
            tratamiento.fecha_fin = datetime.strptime(data["fecha_fin"], "%Y-%m-%d").date() \
                if data["fecha_fin"] else None
        db.session.commit()
        return tratamiento.to_dict()

    @staticmethod
    def delete(id_tratamiento):
        tratamiento = Tratamiento.query.get_or_404(id_tratamiento)
        db.session.delete(tratamiento)
        db.session.commit()