from zoneinfo import ZoneInfo
from app.extensions import db
from app.models.tratamiento import Tratamiento
from app.models.visita_veterinaria import VisitaVeterinaria
from app.services.tarea_service import TareaService
from datetime import datetime, date
from app.models.estado import Estado

class TratamientoService:

    @staticmethod
    def get_all():
        tratamientos = Tratamiento.query.order_by(Tratamiento.fecha_fin.desc().nullsfirst(), Tratamiento.fecha_inicio.desc()).all()
        return [t.to_dict() for t in tratamientos]

    @staticmethod
    def get_by_id(id):
        tratamiento = Tratamiento.query.get(id)
        if not tratamiento:
            raise ValueError("Tratamiento no encontrado")
        return tratamiento.to_dict()

    @staticmethod  
    def create(visita_id, data):
        visita = VisitaVeterinaria.query.get(visita_id)
        if not visita:
            raise ValueError("Visita no encontrada")

        if not data.get("tipo"):
            raise ValueError("El tipo de tratamiento es obligatorio")
        
        if not data.get("fecha_inicio"):
            raise ValueError("La fecha de inicio es obligatoria")

        try:
            fecha_inicio = datetime.strptime(data["fecha_inicio"], "%Y-%m-%d").date()
        except ValueError:
            raise ValueError("Formato de fecha_inicio inválido. Use YYYY-MM-DD")

        fecha_fin = None
        if data.get("fecha_fin"):
            try:
                fecha_fin = datetime.strptime(data["fecha_fin"], "%Y-%m-%d").date()
            except ValueError:
                raise ValueError("Formato de fecha_fin inválido. Use YYYY-MM-DD")
            
            if fecha_fin < fecha_inicio:
                raise ValueError("La fecha de fin no puede ser anterior a la fecha de inicio")

        frecuencia_horas = data.get("frecuencia_horas")
        hora_administracion = None
        
        if frecuencia_horas:
            if not data.get("hora_administracion"):
                raise ValueError("Si se especifica una frecuencia de administración, la hora de inicio de administración es obligatoria.")
            
            if frecuencia_horas not in [8, 12, 24]:
                raise ValueError("La frecuencia debe ser 8, 12 o 24 horas")
            
            try:
                hora_administracion = datetime.strptime(data["hora_administracion"], "%H:%M").time()
            except ValueError:
                raise ValueError("Formato de hora_administracion inválido. Use HH:MM")
        else:
            hora_administracion = None

        tratamiento = Tratamiento(
            visita_id=visita_id,
            tipo=data["tipo"],
            descripcion=data.get("descripcion"),
            fecha_inicio=fecha_inicio,
            fecha_fin=fecha_fin,
            frecuencia_horas=frecuencia_horas,
            hora_administracion=hora_administracion
        )
        
        db.session.add(tratamiento)
        db.session.flush()
        db.session.commit()

        TratamientoService.sincronizar_estado_tratamiento(tratamiento.visita_id)

        return tratamiento.to_dict()

    @staticmethod 
    def update(id, data):
        tratamiento = Tratamiento.query.get(id)
        if not tratamiento:
            raise ValueError("Tratamiento no encontrado")

        from app.models.tarea import Tarea
        tareas_existentes = Tarea.query.filter_by(tratamiento_id=id).count()
        tareas_existen = tareas_existentes > 0

        if "fecha_inicio" in data:
            try:
                fecha_inicio = datetime.strptime(data["fecha_inicio"], "%Y-%m-%d").date()
                tratamiento.fecha_inicio = fecha_inicio
            except ValueError:
                raise ValueError("Formato de fecha_inicio inválido. Use YYYY-MM-DD")

        if "fecha_fin" in data:
            if data["fecha_fin"]:
                try:
                    fecha_fin = datetime.strptime(data["fecha_fin"], "%Y-%m-%d").date()
                    tratamiento.fecha_fin = fecha_fin
                except ValueError:
                    raise ValueError("Formato de fecha_fin inválido. Use YYYY-MM-DD")
            else:
                tratamiento.fecha_fin = None

        if "tipo" in data:
            tratamiento.tipo = data["tipo"]

        if "descripcion" in data:
            tratamiento.descripcion = data["descripcion"]

        if "frecuencia_horas" in data:
            frecuencia = data["frecuencia_horas"]
            if frecuencia is not None and frecuencia not in [8, 12, 24]:
                raise ValueError("La frecuencia debe ser 8, 12 o 24 horas")
            tratamiento.frecuencia_horas = frecuencia

        if "hora_administracion" in data:
            if data["hora_administracion"]:
                try:
                    hora = datetime.strptime(data["hora_administracion"], "%H:%M").time()
                    tratamiento.hora_administracion = hora
                except ValueError:
                    raise ValueError("Formato de hora_administracion inválido. Use HH:MM")
            else:
                tratamiento.hora_administracion = None

        if tratamiento.frecuencia_horas and not tratamiento.hora_administracion:
            raise ValueError("Si se especifica una frecuencia de administración, la hora de inicio de administración es obligatoria.")

        cambios_importantes = any(key in data for key in 
            ["frecuencia_horas", "hora_administracion", "fecha_inicio", "fecha_fin", "tipo", "descripcion"])

        if cambios_importantes and tareas_existen:
            Tarea.query.filter_by(tratamiento_id=id).delete()
            
            try:
                TareaService.crear_tareas_desde_tratamiento(
                    nombre=tratamiento.tipo,
                    fecha_inicio=tratamiento.fecha_inicio.strftime("%Y-%m-%d"),
                    fecha_fin=tratamiento.fecha_fin.strftime("%Y-%m-%d") if tratamiento.fecha_fin else None,
                    descripcion=tratamiento.descripcion,
                    tratamiento_id=tratamiento.id_tratamiento
                )
            except Exception as e:
                db.session.rollback()
                raise ValueError(f"Error al actualizar las tareas del tratamiento: {str(e)}")

        db.session.commit()

        TratamientoService.sincronizar_estado_tratamiento(tratamiento.visita_id)

        return tratamiento.to_dict()

    @staticmethod 
    def delete(id):
        tratamiento = Tratamiento.query.get(id)
        if not tratamiento:
            raise ValueError("Tratamiento no encontrado")

        visita_id = tratamiento.visita_id

        db.session.delete(tratamiento)
        db.session.commit()

        TratamientoService.sincronizar_estado_tratamiento(visita_id)

    @staticmethod
    def sincronizar_estado_tratamiento_por_animal(animal):
        hoy = datetime.now(ZoneInfo("America/Argentina/Buenos_Aires")).date()

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
    
    @staticmethod
    def sincronizar_animales_en_tratamiento():
        from app.models.animal import Animal
        animales = Animal.query.all()
        for animal in animales:
            TratamientoService.sincronizar_estado_tratamiento_por_animal(animal)