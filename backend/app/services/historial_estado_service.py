from datetime import date, datetime
from zoneinfo import ZoneInfo
from app.extensions import db
from app.models.historial_estado import HistorialEstado
from app.models.estado import Estado
from app.models.asociaciones import AnimalPersona
from app.models.rol import Rol

ESTADO_CALCULADO = "En tratamiento" 
ESTADOS_EXCLUSIVOS = [
    {"En tránsito", "En refugio"},
    {"En adopción", "Adoptado"},
]
ESTADO_ROL = {
    "En tránsito": "hogar_transito",
    "Adoptado": "adoptante",
}

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
        hoy = datetime.now(ZoneInfo("America/Argentina/Buenos_Aires")).date()

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

        hoy = datetime.now(ZoneInfo("America/Argentina/Buenos_Aires")).date()
        fecha_desde = datetime.strptime(data["fecha_desde"], "%Y-%m-%d").date()
        if fecha_desde > hoy:
            raise ValueError("El campo fecha_desde no puede ser posterior a hoy")
        
        fecha_hasta = data.get("fecha_hasta")
        if fecha_hasta:
            fecha_hasta = datetime.strptime(fecha_hasta, "%Y-%m-%d").date()
            if fecha_hasta > hoy:
                raise ValueError("El campo fecha_hasta no puede ser posterior a hoy")
            if fecha_hasta < fecha_desde:
                raise ValueError("El campo fecha_hasta no puede ser anterior a fecha_desde")
        
        HistorialEstadoService._validar_rangos(animal_id, estado, fecha_desde, fecha_hasta)

        registro = HistorialEstado(
            animal_id=animal_id,
            estado_id=estado.id_estado,
            persona_id=persona_id,
            fecha_desde=fecha_desde,
            fecha_hasta=fecha_hasta,
        )
        db.session.add(registro)

        if not fecha_hasta:
            if estado not in animal.estados:
                animal.estados.append(estado)
            HistorialEstadoService._sincronizar_persona(animal_id, estado.nombre, persona_id)

        db.session.commit()
        return registro.to_dict()

    @staticmethod
    def update_registro_historial(historial_id, data):
        from app.models.animal import Animal
        from app.models.persona import Persona

        registro = HistorialEstado.query.get(historial_id)
        if not registro:
            raise LookupError(f"Registro de historial con id {historial_id} no encontrado")

        estado_anterior = Estado.query.get(registro.estado_id)
        if "estado_id" in data:
            if not data["estado_id"]:
                raise ValueError("El campo estado_id es obligatorio")
            nuevo_estado = Estado.query.get(data["estado_id"])
            if not nuevo_estado:
                raise LookupError(f"Estado con id {data['estado_id']} no encontrado")
            if nuevo_estado.nombre == ESTADO_CALCULADO:
                raise ValueError(
                    f"El estado '{ESTADO_CALCULADO}' se calcula automáticamente a partir de los tratamientos y no se puede cargar manualmente"
                )
        else:
            nuevo_estado = estado_anterior

        hoy = datetime.now(ZoneInfo("America/Argentina/Buenos_Aires")).date()
        nueva_desde = data.get("fecha_desde", registro.fecha_desde)
        if isinstance(nueva_desde, str):
            nueva_desde = datetime.strptime(nueva_desde, "%Y-%m-%d").date()
        if nueva_desde > hoy:
            raise ValueError("El campo fecha_desde no puede ser posterior a hoy")
        
        nueva_hasta = data["fecha_hasta"] if "fecha_hasta" in data else registro.fecha_hasta
        if isinstance(nueva_hasta, str):
            nueva_hasta = datetime.strptime(nueva_hasta, "%Y-%m-%d").date()
        if nueva_hasta is not None and nueva_hasta > hoy:
            raise ValueError("El campo fecha_hasta no puede ser posterior a hoy")
        if nueva_hasta is not None and nueva_hasta < nueva_desde:
            raise ValueError("El campo fecha_hasta no puede ser anterior a fecha_desde")
        
        HistorialEstadoService._validar_rangos(registro.animal_id, nuevo_estado, nueva_desde, nueva_hasta, historial_id=registro.id)

        estaba_abierto = registro.fecha_hasta is None
        quedara_abierto = nueva_hasta is None

        if "persona_id" in data:
            persona_id = data["persona_id"]
            if persona_id and not Persona.query.get(persona_id):
                raise LookupError(f"Persona con id {persona_id} no encontrada")
            registro.persona_id = persona_id

        registro.estado_id = nuevo_estado.id_estado
        registro.fecha_desde = nueva_desde
        registro.fecha_hasta = nueva_hasta

        animal = Animal.query.get(registro.animal_id)
        estado_cambio = nuevo_estado.id_estado != estado_anterior.id_estado

        if animal:
            if estaba_abierto and (not quedara_abierto or estado_cambio):
                if estado_anterior in animal.estados:
                    animal.estados.remove(estado_anterior)
            if quedara_abierto and (not estaba_abierto or estado_cambio):
                if nuevo_estado not in animal.estados:
                    animal.estados.append(nuevo_estado)
        
        if estaba_abierto and (not quedara_abierto or estado_cambio):
            HistorialEstadoService._sincronizar_persona(registro.animal_id, estado_anterior.nombre, None)
        if quedara_abierto:
            HistorialEstadoService._sincronizar_persona(registro.animal_id, nuevo_estado.nombre, registro.persona_id)
        
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
        estado = Estado.query.get(registro.estado_id)

        db.session.delete(registro)
        db.session.flush()

        if era_abierto:
            animal = Animal.query.get(animal_id)
            if animal and estado and estado in animal.estados:
                animal.estados.remove(estado)
            if estado:
                HistorialEstadoService._sincronizar_persona(animal_id, estado.nombre, None)

        db.session.commit()

    @staticmethod
    def _sincronizar_persona(animal_id, estado_nombre, persona_id):
        rol_nombre = ESTADO_ROL.get(estado_nombre)
        if not rol_nombre:
            return

        rol = Rol.query.filter_by(nombre=rol_nombre).first()
        if not rol:
            return

        actual = AnimalPersona.query.filter_by(animal_id=animal_id, rol_id=rol.id_rol).first()

        if persona_id:
            if not actual or actual.persona_id != persona_id:
                if actual:
                    db.session.delete(actual)
                db.session.add(AnimalPersona(animal_id=animal_id, persona_id=persona_id, rol_id=rol.id_rol))
        else:
            if actual:
                db.session.delete(actual)

    @staticmethod
    def _rangos_se_solapan(desde1, hasta1, desde2, hasta2):
        fin1 = hasta1 or date.max
        fin2 = hasta2 or date.max
        return desde1 <= fin2 and desde2 <= fin1

    @staticmethod
    def _validar_rangos(animal_id, estado, fecha_desde, fecha_hasta, historial_id=None):
        # No puede haber dos registros del mismo estado que se solapen
        query_mismo = HistorialEstado.query.filter_by(
            animal_id=animal_id, estado_id=estado.id_estado
        )
        if historial_id:
            query_mismo = query_mismo.filter(HistorialEstado.id != historial_id)

        for registro in query_mismo.all():
            if HistorialEstadoService._rangos_se_solapan(
                fecha_desde, fecha_hasta, registro.fecha_desde, registro.fecha_hasta
            ):
                raise ValueError(
                    f"Ya existe un registro del estado '{estado.nombre}' que se solapa con el período indicado"
                )

        # Estados mutuamente excluyentes no pueden solaparse
        excluyentes = set()
        for grupo in ESTADOS_EXCLUSIVOS:
            if estado.nombre in grupo:
                excluyentes |= (grupo - {estado.nombre})

        if excluyentes:
            query_excl = HistorialEstado.query.join(
                Estado, HistorialEstado.estado_id == Estado.id_estado
            ).filter(
                HistorialEstado.animal_id == animal_id,
                Estado.nombre.in_(excluyentes),
            )
            if historial_id:
                query_excl = query_excl.filter(HistorialEstado.id != historial_id)

            for registro in query_excl.all():
                if HistorialEstadoService._rangos_se_solapan(
                    fecha_desde, fecha_hasta, registro.fecha_desde, registro.fecha_hasta
                ):
                    raise ValueError(
                        f"El animal no puede estar en el estado '{estado.nombre}' y '{registro.estado.nombre}' al mismo tiempo"
                    )