# app/services/tratamiento_service.py

from datetime import date, datetime
from app.extensions import db
from app.models.tratamiento import Tratamiento
from app.models.estado import Estado
from app.models.visita_veterinaria import VisitaVeterinaria
from app.routes.notificaciones_routes import (
    notificar_tratamiento_actualizado,  
)


class TratamientoService:

    @staticmethod
    def get_all():
        tratamientos = Tratamiento.query.order_by(Tratamiento.fecha_fin.desc()).all()
        return [t.to_dict() for t in tratamientos]

    @staticmethod
    def create(visita_id, data):
        fecha_inicio = datetime.strptime(data["fecha_inicio"], "%Y-%m-%d").date()

        existente = Tratamiento.query.filter_by(
            visita_id=visita_id,
            tipo=data["tipo"],
            fecha_inicio=fecha_inicio
        ).first()

        if existente:
            raise ValueError("Ya existe un tratamiento con el mismo tipo y fecha de inicio para esta visita.")

        tratamiento = Tratamiento(
            tipo=data["tipo"],
            descripcion=data.get("descripcion"),
            fecha_inicio=fecha_inicio,
            fecha_fin=datetime.strptime(data["fecha_fin"], "%Y-%m-%d").date() 
                if data.get("fecha_fin") else None,
            visita_id=visita_id
        )

        db.session.add(tratamiento)
        db.session.commit()
        db.session.refresh(tratamiento)   
        
        TratamientoService.sincronizar_estado_tratamiento(tratamiento.visita_id)
        
        return tratamiento.to_dict()
    
    @staticmethod
    def update(id_tratamiento, data):
        tratamiento = Tratamiento.query.get_or_404(id_tratamiento)
        
        nuevo_tipo = data.get("tipo") if "tipo" in data else None
        nueva_fecha_inicio = data.get("fecha_inicio") if "fecha_inicio" in data else None
        if nuevo_tipo:
            query = Tratamiento.query.filter(
                Tratamiento.tipo == nuevo_tipo,
                Tratamiento.visita_id == tratamiento.visita_id,
                Tratamiento.id_tratamiento != id_tratamiento
            )

            if nueva_fecha_inicio:
                query = query.filter(Tratamiento.fecha_inicio == nueva_fecha_inicio)
            else:
                query = query.filter(Tratamiento.fecha_inicio == tratamiento.fecha_inicio)
        
            existente = query.first()
            if existente:
                raise ValueError(f"Ya existe un tratamiento con el tipo '{nuevo_tipo}' en esta visita")
        
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

    
        try:
            notificar_tratamiento_actualizado(tratamiento)
        except Exception as e:
            print(f"[ERROR NOTIFICACIÓN TRATAMIENTO ACTUALIZADO] {e}")

        return tratamiento.to_dict()

    @staticmethod
    def delete(id_tratamiento):
        tratamiento = Tratamiento.query.get_or_404(id_tratamiento)
        visita_id = tratamiento.visita_id

        db.session.delete(tratamiento)
        db.session.commit()

        TratamientoService.sincronizar_estado_tratamiento(visita_id)

    @staticmethod
    def sincronizar_estado_tratamiento_por_animal(animal):
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

    @staticmethod
    def sincronizar_estado_tratamiento(visita_id):
        visita = VisitaVeterinaria.query.get(visita_id)
        if not visita or not visita.animal:
            return
        TratamientoService.sincronizar_estado_tratamiento_por_animal(visita.animal)