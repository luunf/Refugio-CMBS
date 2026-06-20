from datetime import date, datetime
from app.extensions import db
from app.models.tratamiento import Tratamiento
from app.models.estado import Estado
from app.models.visita_veterinaria import VisitaVeterinaria


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

        TratamientoService.sincronizar_estado_tratamiento(tratamiento.visita_id)

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
        
        TratamientoService.sincronizar_estado_tratamiento(tratamiento.visita_id)
        return tratamiento.to_dict()

    @staticmethod
    def delete(id_tratamiento):
        tratamiento = Tratamiento.query.get_or_404(id_tratamiento)
        visita_id = tratamiento.visita_id
        db.session.delete(tratamiento)
        db.session.commit()

        TratamientoService.sincronizar_estado_tratamiento(visita_id)

    @staticmethod
    def sincronizar_estado_tratamiento(visita_id):
        visita = VisitaVeterinaria.query.get(visita_id)
        if not visita:
            return
        animal = visita.animal
        hoy = date.today()

        tiene_vigente = any(
            t.fecha_inicio <= hoy and (t.fecha_fin is None or t.fecha_fin >= hoy)
            for v in animal.visitas
            for t in v.tratamientos
        )

        estado_tratamiento = Estado.query.filter_by(nombre="En tratamiento").first()
        if not estado_tratamiento:
            return

        if tiene_vigente and estado_tratamiento not in animal.estados:
            animal.estados.append(estado_tratamiento)
        elif not tiene_vigente and estado_tratamiento in animal.estados:
            animal.estados.remove(estado_tratamiento)

        db.session.commit()