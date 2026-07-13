from datetime import date, datetime
from app.extensions import db
from app.models.historial_estado import HistorialEstado
from app.models.estado import Estado

ESTADO_CALCULADO = "En tratamiento" 

class HistorialEstadoService:

    @staticmethod
    def sincronizar_estados(animal, nuevos_estados, personas_por_estado=None):

        personas_por_estado = personas_por_estado or {}

        estado_calculado_actual = [e for e in animal.estados if e.nombre == ESTADO_CALCULADO]

        actuales_ids = {e.id_estado for e in animal.estados if e.nombre != ESTADO_CALCULADO}
        nuevos_ids = {e.id_estado for e in nuevos_estados if e.nombre != ESTADO_CALCULADO}

        agregados = nuevos_ids - actuales_ids
        quitados = actuales_ids - nuevos_ids
        mantenidos = actuales_ids & nuevos_ids
        hoy = date.today()

        for estado_id in quitados:
            abierto = HistorialEstado.query.filter_by(
                animal_id=animal.id_animal, estado_id=estado_id, fecha_hasta=None
            ).first()
            if abierto:
                abierto.fecha_hasta = hoy

        for estado_id in agregados:
            db.session.add(HistorialEstado(
                animal_id=animal.id_animal,
                estado_id=estado_id,
                persona_id=personas_por_estado.get(estado_id),
                fecha_desde=hoy,
            ))

        for estado_id in mantenidos:
            if estado_id not in personas_por_estado:
                continue
            nueva_persona_id = personas_por_estado[estado_id]
            abierto = HistorialEstado.query.filter_by(
                animal_id=animal.id_animal, estado_id=estado_id, fecha_hasta=None
            ).first()
            if abierto and abierto.persona_id != nueva_persona_id:
                abierto.fecha_hasta = hoy
                db.session.add(HistorialEstado(
                    animal_id=animal.id_animal,
                    estado_id=estado_id,
                    persona_id=nueva_persona_id,
                    fecha_desde=hoy,
                ))

        animal.estados = nuevos_estados + estado_calculado_actual

    @staticmethod
    def get_historial(animal_id):

        from app.models.animal import Animal
        animal = Animal.query.get(animal_id)
        if not animal:
            raise LookupError(f"Animal con id {animal_id} no encontrado")

        manuales = HistorialEstado.query.filter_by(animal_id=animal_id) \
            .order_by(
                HistorialEstado.fecha_hasta.is_(None).desc(),
                HistorialEstado.fecha_hasta.desc(),
                HistorialEstado.fecha_desde.desc(),
            ).all()

        return [h.to_dict() for h in manuales]

    @staticmethod
    def create_registro_historial(animal_id, data):
        from app.models.animal import Animal
        from app.models.persona import Persona

        animal = Animal.query.get(animal_id)
        if not animal:
            raise LookupError(f"Animal con id {animal_id} no encontrado")

        if not data.get("estado_id"):
            raise ValueError("El campo estado_id es obligatorio")
        if not data.get("fecha_desde"):
            raise ValueError("El campo fecha_desde es obligatorio")

        estado = Estado.query.get(data["estado_id"])
        if not estado:
            raise LookupError(f"Estado con id {data['estado_id']} no encontrado")
        persona_id = data.get("persona_id")
        if persona_id and not Persona.query.get(persona_id):
            raise LookupError(f"Persona con id {persona_id} no encontrada")

        if estado.nombre == ESTADO_CALCULADO:
            raise ValueError(
                f"El estado '{ESTADO_CALCULADO}' se calcula automáticamente a partir de los tratamientos y no se puede cargar manualmente"
            )

        fecha_hasta = data.get("fecha_hasta")
        if fecha_hasta:
            fecha_hasta = datetime.strptime(fecha_hasta, "%Y-%m-%d").date()
            if fecha_hasta >= date.today():
                raise ValueError("El campo fecha_hasta debe ser anterior a hoy")

        fecha_desde = datetime.strptime(data["fecha_desde"], "%Y-%m-%d").date()

        registro = HistorialEstado(
            animal_id=animal_id,
            estado_id=estado.id_estado,
            persona_id=persona_id,
            fecha_desde=fecha_desde,
            fecha_hasta=fecha_hasta,
        )
        db.session.add(registro)

        if not fecha_hasta and estado not in animal.estados:
            animal.estados.append(estado)

        db.session.commit()
        return registro.to_dict()

    @staticmethod
    def update_registro_historial(historial_id, data):
        from app.models.animal import Animal
        from app.models.persona import Persona

        registro = HistorialEstado.query.get(historial_id)
        if not registro:
            raise LookupError(f"Registro de historial con id {historial_id} no encontrado")

        nueva_desde = data.get("fecha_desde", registro.fecha_desde)
        if isinstance(nueva_desde, str):
            nueva_desde = datetime.strptime(nueva_desde, "%Y-%m-%d").date()

        nueva_hasta = data["fecha_hasta"] if "fecha_hasta" in data else registro.fecha_hasta
        if isinstance(nueva_hasta, str):
            nueva_hasta = datetime.strptime(nueva_hasta, "%Y-%m-%d").date()
        if nueva_hasta is not None and nueva_hasta >= date.today():
            raise ValueError("El campo fecha_hasta debe ser anterior a hoy")
        
        estaba_abierto = registro.fecha_hasta is None
        quedara_abierto = nueva_hasta is None

        if "persona_id" in data:
            persona_id = data["persona_id"]
            if persona_id and not Persona.query.get(persona_id):
                raise LookupError(f"Persona con id {persona_id} no encontrada")
            registro.persona_id = persona_id

        registro.fecha_desde = nueva_desde
        registro.fecha_hasta = nueva_hasta

        if estaba_abierto != quedara_abierto:
            animal = Animal.query.get(registro.animal_id)
            estado = Estado.query.get(registro.estado_id)
            if animal and estado:
                if quedara_abierto and estado not in animal.estados:
                    animal.estados.append(estado)
                elif not quedara_abierto and estado in animal.estados:
                    animal.estados.remove(estado)

        db.session.commit()
        return registro.to_dict()

    @staticmethod
    def delete_registro_historial(historial_id):
        from app.models.animal import Animal

        registro = HistorialEstado.query.get(historial_id)
        if not registro:
            raise LookupError(f"Registro de historial con id {historial_id} no encontrado")

        era_abierto = registro.fecha_hasta is None
        animal_id = registro.animal_id
        estado_id = registro.estado_id

        db.session.delete(registro)
        db.session.flush()

        if era_abierto:
            animal = Animal.query.get(animal_id)
            estado = Estado.query.get(estado_id)
            if animal and estado and estado in animal.estados:
                animal.estados.remove(estado)

        db.session.commit()