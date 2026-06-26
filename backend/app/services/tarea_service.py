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
            raise Exception("Tarea no encontrada")
        return tarea.to_dict()

    @staticmethod
    def crear_tarea(data,asignado_por="Sistema"):
        personas_ids = data.pop("personas_ids", [])
        tarea = Tarea(
            nombre=data["nombre"],
            fecha=data["fecha"],
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
        print(
            f"[DEBUG] Enviando notificación a personas: {personas_ids}"
        )

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
        """
        Crea una tarea por cada día entre fecha_inicio y fecha_fin (inclusive).
        Todas son visibles para todos los voluntarios (sin personas_ids específicas,
        ya que es un cuidado general del refugio).
        """
        inicio = dt.strptime(fecha_inicio, "%Y-%m-%d").date()
        fin = dt.strptime(fecha_fin, "%Y-%m-%d").date() if fecha_fin else inicio

        if fin < inicio:
            raise Exception("La fecha de fin no puede ser anterior a la fecha de inicio")

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
    def actualizar_tarea(
        id,
        data,
        actualizado_por="Sistema"
    ):
        tarea = Tarea.query.get(id)

        if not tarea:
            raise Exception("Tarea no encontrada")

        was_completed = tarea.completada

        personas_ids = data.pop("personas_ids", None)

        for key, value in data.items():
            if hasattr(tarea, key):
                setattr(tarea, key, value)

        if personas_ids is not None:
            personas = Persona.query.filter(
                Persona.id_persona.in_(personas_ids)
            ).all()

            tarea.personas = personas

            for persona in tarea.personas:
                enviar_email_modificacion(
                    persona,
                    tarea
                )

        db.session.commit()

        if (
            not was_completed and
            tarea.completada
        ):
            if tarea.visita_id and tarea.visita.estado != "realizada":
                tarea.visita.estado = "realizada"
                db.session.commit()

            notificar_tarea_completada(
                tarea=tarea,
                completada_por=actualizado_por
            )
        elif (
            was_completed and
            not tarea.completada
        ):
            if tarea.visita_id and tarea.visita.estado != "proxima":
                tarea.visita.estado = "proxima"
                db.session.commit()

        return tarea.to_dict()

    @staticmethod
    def eliminar_tarea(id, cancelada_por="Sistema"):
        tarea = Tarea.query.get(id)

        if not tarea:
            raise Exception("Tarea no encontrada")

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
            raise Exception("Persona no encontrada")
        return [t.to_dict() for t in persona.tareas]

    @staticmethod
    def get_personas_by_tarea(tarea_id):
        tarea = Tarea.query.get(tarea_id)
        if not tarea:
            raise Exception("Tarea no encontrada")
        return [p.to_dict() for p in tarea.personas]