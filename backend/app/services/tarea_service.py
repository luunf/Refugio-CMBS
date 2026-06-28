from app.extensions import db
from app.models.tarea import Tarea
from app.models.persona import Persona
from app.utils.email import enviar_email_asignacion, enviar_email_modificacion
from datetime import timedelta, datetime as dt
from app.routes.notificaciones_routes import (
    notificar_tarea_asignada,
    notificar_tarea_completada,
    notificar_tarea_cancelada,
)

class TareaService:

    @staticmethod
    def get_all_tareas(mes=None, year=None):
        query = Tarea.query
        if mes and year:
            query = query.filter(
                db.extract("month", Tarea.fecha) == int(mes),
                db.extract("year", Tarea.fecha) == int(year)
            )
        return [t.to_dict() for t in query.all()]

    @staticmethod
    def get_tarea_by_id(id):
        tarea = Tarea.query.get(id)
        if not tarea:
            raise ValueError("Tarea no encontrada")
        return tarea.to_dict()

    @staticmethod
    def crear_tarea(data, asignado_por="Sistema"):
        personas_ids = data.pop("personas_ids", [])
        tarea = Tarea(
            nombre=data.get("nombre"),
            fecha=data.get("fecha"),
            hora=data.get("hora"),
            es_todo_el_dia=data.get("es_todo_el_dia", False),
            completada=data.get("completada", False)
        )
        db.session.add(tarea)
        db.session.flush()
        if personas_ids:
            personas = Persona.query.filter(Persona.id_persona.in_(personas_ids)).all()
            tarea.personas = personas

        db.session.commit()
        print(f"[DEBUG] Enviando notificación a personas: {personas_ids}")

        notificar_tarea_asignada(
            tarea=tarea,
            personas_ids=personas_ids,
            asignado_por=asignado_por
        )

        for persona in tarea.personas:
            enviar_email_asignacion(persona, tarea)

        return tarea.to_dict()

    @staticmethod
    def crear_tareas_desde_tratamiento(nombre, fecha_inicio, fecha_fin, descripcion=None):
        print(f"[DEBUG] Intentando agendar: nombre={nombre}, inicio={fecha_inicio}, fin={fecha_fin}")
        inicio = dt.strptime(fecha_inicio, "%Y-%m-%d").date()
        fin = dt.strptime(fecha_fin, "%Y-%m-%d").date() if fecha_fin else inicio

        if fin < inicio:
           raise ValueError("La fecha de fin no puede ser anterior a la fecha de inicio")

        if (fin - inicio).days > 90:
           raise ValueError("El rango del tratamiento no puede superar los 90 días")

        existentes = Tarea.query.filter(
            Tarea.nombre == nombre,
            Tarea.fecha >= inicio,
            Tarea.fecha <= fin,
            Tarea.es_todo_el_dia == True
        ).count()
        
        print(f"[DEBUG] Tareas existentes encontradas: {existentes}")
        
        if existentes > 0:
            raise ValueError("Este tratamiento ya fue agendado previamente")
        
        tareas_creadas = []
        fecha_actual = inicio

        while fecha_actual <= fin:
            tarea = Tarea(
                nombre=nombre,
                fecha=fecha_actual,
                hora=None,
                es_todo_el_dia=True,
                completada=False
            )
            db.session.add(tarea)
            tareas_creadas.append(tarea)
            fecha_actual += timedelta(days=1)

        db.session.commit()
        return [t.to_dict() for t in tareas_creadas]

    @staticmethod
    def actualizar_tarea(id, data, actualizado_por="Sistema"):
        tarea = Tarea.query.get(id)

        if not tarea:
            raise ValueError("Tarea no encontrada")
        
        nuevo_nombre = data.get("nombre") if "nombre" in data else None
        nueva_fecha = data.get("fecha") if "fecha" in data else None
        

        if nuevo_nombre:
            query = Tarea.query.filter(
                Tarea.nombre == nuevo_nombre,
                Tarea.id_tarea != id
            )
        
            if nueva_fecha:
                query = query.filter(Tarea.fecha == nueva_fecha)
            else:
                query = query.filter(Tarea.fecha == tarea.fecha)
        
            existente = query.first()
            if existente:
                raise ValueError(f"Ya existe una tarea con el nombre '{nuevo_nombre}' en la fecha {existente.fecha}")
        
        was_completed = tarea.completada
        personas_anteriores = set(p.id_persona for p in tarea.personas)

        personas_ids = data.pop("personas_ids", None)

        nueva_fecha_parseada = None
        if "fecha" in data and data["fecha"]:
            nueva_fecha_parseada = dt.strptime(data["fecha"], "%Y-%m-%d").date()

        nueva_hora_parseada = None
        if "hora" in data and data["hora"]:
            nueva_hora_parseada = dt.strptime(data["hora"], "%H:%M").time()

        fecha_cambio = "fecha" in data and nueva_fecha_parseada != tarea.fecha
        hora_cambio = "hora" in data and nueva_hora_parseada != tarea.hora

        for key, value in data.items():
            if hasattr(tarea, key):
                setattr(tarea, key, value)

        if personas_ids is not None:
            personas = Persona.query.filter(
                Persona.id_persona.in_(personas_ids)
            ).all()
            tarea.personas = personas

            encontrados = {p.id_persona for p in personas}
            inexistentes = set(personas_ids) - encontrados
            
            if inexistentes:
                raise ValueError(f"Las siguientes personas no existen: {list(inexistentes)}")
            
            for persona in tarea.personas:
                enviar_email_modificacion(persona, tarea)

            # ─── NOTIFICAR PUSH A NUEVOS VOLUNTARIOS ───
            nuevas_personas = [p.id_persona for p in personas if p.id_persona not in personas_anteriores]
            if nuevas_personas:
                print(f"[DEBUG] Nuevos voluntarios asignados: {nuevas_personas}")
                notificar_tarea_asignada(
                    tarea=tarea,
                    personas_ids=nuevas_personas,
                    asignado_por=actualizado_por
                )

        if (fecha_cambio or hora_cambio) and tarea.visita_id and tarea.visita:
            if fecha_cambio:
                tarea.visita.fecha = nueva_fecha_parseada
            if hora_cambio:
                tarea.visita.hora = nueva_hora_parseada

        db.session.commit()

        if not was_completed and tarea.completada:
            if tarea.visita_id and tarea.visita.estado != "realizada":
                tarea.visita.estado = "realizada"
                db.session.commit()

            notificar_tarea_completada(
                tarea=tarea,
                completada_por=actualizado_por
            )
        elif was_completed and not tarea.completada:
            if tarea.visita_id and tarea.visita.estado != "proxima":
                tarea.visita.estado = "proxima"
                db.session.commit()

        return tarea.to_dict()

    @staticmethod
    def eliminar_tarea(id, cancelada_por="Sistema"):
        tarea = Tarea.query.get(id)

        if not tarea:
            raise ValueError("Tarea no encontrada")

        if cancelada_por:
            notificar_tarea_cancelada(
                tarea=tarea,
                cancelada_por=cancelada_por
            )

        db.session.delete(tarea)
        db.session.commit()

    @staticmethod
    def get_tareas_by_persona(persona_id):
        persona = Persona.query.get(persona_id)
        if not persona:
            raise ValueError("Persona no encontrada")
        return [t.to_dict() for t in persona.tareas]

    @staticmethod
    def get_personas_by_tarea(tarea_id):
        tarea = Tarea.query.get(tarea_id)
        if not tarea:
            raise ValueError("Tarea no encontrada")
        return [p.to_dict() for p in tarea.personas]