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
        
        hora_administracion = None
        if data.get("hora_administracion"):
            hora_administracion = datetime.strptime(data["hora_administracion"], "%H:%M").time()

        tratamiento = Tratamiento(
            tipo=data["tipo"],
            descripcion=data.get("descripcion"),
            fecha_inicio=fecha_inicio,
            fecha_fin=datetime.strptime(data["fecha_fin"], "%Y-%m-%d").date() 
                if data.get("fecha_fin") else None,
            frecuencia_horas=data.get("frecuencia_horas"),
            hora_administracion=hora_administracion,
            visita_id=visita_id
        )

        db.session.add(tratamiento)
        db.session.commit()
        db.session.refresh(tratamiento)   
        
        TratamientoService.sincronizar_estado_tratamiento(tratamiento.visita_id)
        
        return tratamiento.to_dict()
    
    @staticmethod
    def update(id_tratamiento, data):
        from app.models.tarea import Tarea
        
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
        if "frecuencia_horas" in data:
            tratamiento.frecuencia_horas = data["frecuencia_horas"]
        if "hora_administracion" in data:
            hora_str = data["hora_administracion"]
            if hora_str:
                try:
                    tratamiento.hora_administracion = datetime.strptime(hora_str, "%H:%M").time()
                except ValueError:
                    raise ValueError("Formato de hora inválido. Use HH:MM")
            else:
                tratamiento.hora_administracion = None

        db.session.commit()
        
        if "tipo" in data or "descripcion" in data or "hora_administracion" in data:
            tareas = Tarea.query.filter_by(tratamiento_id=id_tratamiento).all()
            
            for tarea in tareas:
                if "tipo" in data:
                    nombre_animal = tratamiento.visita.animal.nombre if tratamiento.visita and tratamiento.visita.animal else "animal"
                    tarea.nombre = f"{tratamiento.tipo} - {nombre_animal}"
                
                if "descripcion" in data:
                    tarea.descripcion = tratamiento.descripcion
                
                if "hora_administracion" in data:
                    tarea.hora = tratamiento.hora_administracion.strftime("%H:%M") if tratamiento.hora_administracion else None
                    tarea.es_todo_el_dia = not (tratamiento.hora_administracion is not None)
            
            db.session.commit()

        TratamientoService.sincronizar_estado_tratamiento(tratamiento.visita_id)

        try:
            notificar_tratamiento_actualizado(tratamiento)
        except Exception as e:
            print(f"[ERROR NOTIFICACIÓN TRATAMIENTO ACTUALIZADO] {e}")

        return tratamiento.to_dict()

    @staticmethod
    def delete(id_tratamiento):
        from app.models.tarea import Tarea
        
        tratamiento = Tratamiento.query.get_or_404(id_tratamiento)
        visita_id = tratamiento.visita_id

        Tarea.query.filter_by(tratamiento_id=id_tratamiento).delete()
        
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