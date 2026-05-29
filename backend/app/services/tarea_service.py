from app.extensions import db
from app.models.tarea import Tarea
from app.models.persona import Persona
from app.utils.email import enviar_email_asignacion, enviar_email_modificacion

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
    def crear_tarea(data):
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
        for persona in tarea.personas:
            enviar_email_asignacion(persona, tarea)
        return tarea.to_dict()

    @staticmethod
    def actualizar_tarea(id, data):
        tarea = Tarea.query.get(id)
        if not tarea:
            raise Exception("Tarea no encontrada")
        personas_ids = data.pop("personas_ids", None)
        for key, value in data.items():
            if hasattr(tarea, key):
                setattr(tarea, key, value)
        if personas_ids is not None:
            personas = Persona.query.filter(Persona.id_persona.in_(personas_ids)).all()
            tarea.personas = personas
            for persona in tarea.personas:
                enviar_email_modificacion(persona, tarea)
        db.session.commit()
        return tarea.to_dict()

    @staticmethod
    def eliminar_tarea(id):
        tarea = Tarea.query.get(id)
        if not tarea:
            raise Exception("Tarea no encontrada")
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