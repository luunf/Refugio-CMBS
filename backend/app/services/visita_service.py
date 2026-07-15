from datetime import datetime
from app.extensions import db
from app.models.visita_veterinaria import VisitaVeterinaria
from app.models.animal import Animal
from app.models.persona import Persona
from app.models.tarea import Tarea
from app.services.tratamiento_service import TratamientoService
from app.routes.notificaciones_routes import notificar_tarea_completada


class VisitaService:

    @staticmethod
    def get_visitas(animal_id, estado=None):
        animal = Animal.query.get(animal_id)
        if not animal:
            raise LookupError(f"Animal con id {animal_id} no encontrado")

        query = VisitaVeterinaria.query.filter_by(animal_id=animal_id)
        if estado:
            query = query.filter_by(estado=estado)

        visitas = query.order_by(VisitaVeterinaria.fecha.desc()).all()
        return [
            {
                "id_visita": v.id_visita,
                "procedimiento": v.procedimiento,
                "fecha": str(v.fecha),
                "hora": v.hora.strftime("%H:%M") if v.hora else None,
                "estado": v.estado,
            }
            for v in visitas
        ]

    @staticmethod
    def create_visita(animal_id, data):
        animal = Animal.query.get(animal_id)
        if not animal:
            raise LookupError(f"Animal con id {animal_id} no encontrado")

        veterinario = Persona.query.get(data["veterinario_id"])
        if not veterinario:
            raise ValueError(f"Veterinario con id {data['veterinario_id']} no encontrado")
        
        visita = VisitaVeterinaria(
            fecha=datetime.strptime(data["fecha"], "%Y-%m-%d").date(),
            hora=datetime.strptime(data["hora"], "%H:%M").time() if data.get("hora") else None,
            estado=data.get("estado", "realizada"),
            procedimiento=data["procedimiento"],
            info_adicional=data.get("info_adicional"),
            costo=data.get("costo"),
            animal_id=animal_id,
            veterinario_id=data["veterinario_id"],
        )
        db.session.add(visita)
        db.session.flush()

        tarea = None
        if visita.estado == "proxima":
            tarea = Tarea(
                nombre=f"Visita veterinaria {animal.nombre}",
                fecha=visita.fecha,
                hora=visita.hora,
                es_todo_el_dia=visita.hora is None,
                visita_id=visita.id_visita,
            )
            db.session.add(tarea)

        db.session.commit()
        return visita, tarea
    
        
    @staticmethod
    def get_visita(visita_id):
        visita = VisitaVeterinaria.query.get(visita_id)
        if not visita:
            raise LookupError(f"Visita con id {visita_id} no encontrada")

        return {
            "id_visita": visita.id_visita,
            "fecha": str(visita.fecha),
            "hora": visita.hora.strftime("%H:%M") if visita.hora else None,
            "estado": visita.estado,
            "procedimiento": visita.procedimiento,
            "info_adicional": visita.info_adicional,
            "costo": float(visita.costo) if visita.costo else None,
            "animal_id": visita.animal_id,
            "veterinario": {
                "id_persona": visita.veterinario.id_persona,
                "nombre": visita.veterinario.nombre,
                "apellido": visita.veterinario.apellido,
            },
            "tratamientos": [
                {
                    "id_tratamiento": t.id_tratamiento,
                    "tipo": t.tipo,
                    "descripcion": t.descripcion,
                    "fecha_inicio": str(t.fecha_inicio),
                    "fecha_fin": str(t.fecha_fin) if t.fecha_fin else None,
                    "frecuencia_horas": t.frecuencia_horas,
                    "hora_administracion": t.hora_administracion.strftime("%H:%M") if t.hora_administracion else None,
                }
                for t in sorted(visita.tratamientos, key=lambda t: (t.fecha_fin is None, t.fecha_fin or t.fecha_inicio, t.fecha_inicio,), reverse=True)
            ],
        }

    @staticmethod
    def update_visita(visita_id, data, actualizado_por="Sistema"):
        visita = VisitaVeterinaria.query.get(visita_id)
        if not visita:
            raise LookupError(f"Visita con id {visita_id} no encontrada")

        if "veterinario_id" in data:
            veterinario = Persona.query.get(data["veterinario_id"])
            if not veterinario:
                raise ValueError(f"Veterinario con id {data['veterinario_id']} no encontrado")
            visita.veterinario_id = data["veterinario_id"]

        if "fecha" in data:
            visita.fecha = datetime.strptime(data["fecha"], "%Y-%m-%d").date()
        if "hora" in data:
            visita.hora = datetime.strptime(data["hora"], "%H:%M").time() if data["hora"] else None
        if "estado" in data:
            visita.estado = data["estado"]
        if "procedimiento" in data:
            visita.procedimiento = data["procedimiento"]
        if "info_adicional" in data:
            visita.info_adicional = data["info_adicional"]
        if "costo" in data:
            visita.costo = data["costo"]

        db.session.commit()

        tenia_tarea = visita.tarea is not None
        VisitaService.sincronizar_tarea(visita, actualizado_por=actualizado_por)
        tarea_creada = visita.estado == "proxima" and not tenia_tarea and visita.tarea is not None

        return {
            "message": "Visita actualizada correctamente.",
            "tarea_creada": tarea_creada,
            "tarea_nombre": visita.tarea.nombre if tarea_creada else None,
        }

    @staticmethod
    def delete_visita(visita_id):
        visita = VisitaVeterinaria.query.get(visita_id)
        if not visita:
            raise LookupError(f"Visita con id {visita_id} no encontrada")

        animal = visita.animal

        db.session.delete(visita)
        db.session.flush()
        
        TratamientoService.sincronizar_estado_tratamiento_por_animal(animal)

        db.session.commit()
    
    @staticmethod
    def sincronizar_tarea(visita, actualizado_por="Sistema"):
        tarea = visita.tarea

        if visita.estado == "realizada":
            if not tarea:
                return
            tarea.fecha = visita.fecha
            tarea.hora = visita.hora
            tarea.es_todo_el_dia = visita.hora is None
            ya_estaba_completada = tarea.completada
            tarea.completada = True
            db.session.commit()
            if not ya_estaba_completada:
                notificar_tarea_completada(
                    tarea=tarea,
                    completada_por=actualizado_por
                )
            return

        if visita.estado == "proxima":
            if tarea:
                tarea.fecha = visita.fecha
                tarea.hora = visita.hora
                tarea.es_todo_el_dia = visita.hora is None
                tarea.nombre = f"Visita veterinaria {visita.animal.nombre}"
                tarea.completada = False
            else:
                tarea = Tarea(
                    nombre=f"Visita veterinaria {visita.animal.nombre}",
                    fecha=visita.fecha,
                    hora=visita.hora,
                    es_todo_el_dia=visita.hora is None,
                    visita_id=visita.id_visita,
                )
                db.session.add(tarea)
            db.session.commit()
    


