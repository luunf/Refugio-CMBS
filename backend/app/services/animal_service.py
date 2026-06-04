from app.extensions import db
from app.models import Animal, Estado, Compatibilidad, Persona, AnimalPersona, Rol
from sqlalchemy.orm import joinedload

TIPOS_VALIDOS = {"perro", "gato"}
GENEROS_VALIDOS = {"macho", "hembra"}
TAMANIOS_VALIDOS = {"grande", "mediano", "chico"}
ROLES_VALIDOS = {"voluntario", "hogar_transito", "adoptante"}

class AnimalService:
    
    @staticmethod
    def create_animal(data):

        if data["tipo"] not in TIPOS_VALIDOS:
            raise ValueError(f"Tipo inválido. Valores permitidos: {', '.join(TIPOS_VALIDOS)}")

        if data["genero"] not in GENEROS_VALIDOS:
            raise ValueError(f"Género inválido. Valores permitidos: {', '.join(GENEROS_VALIDOS)}")

        if data["tamanio"] not in TAMANIOS_VALIDOS:
            raise ValueError(f"Tamaño inválido. Valores permitidos: {', '.join(TAMANIOS_VALIDOS)}")

        roles = {r.nombre: r.id_rol for r in Rol.query.filter(Rol.nombre.in_(ROLES_VALIDOS)).all()}

        estados = []
        for id_estado in data["estados"] or []:
            estado = Estado.query.get(id_estado)
            if not estado:
                raise LookupError(f"Estado con id {id_estado} no encontrado")
            estados.append(estado)

        compatibilidades = []
        for id_comp in data.get("compatibilidades") or []:
            comp = Compatibilidad.query.get(id_comp)
            if not comp:
                raise LookupError(f"Compatibilidad con id {id_comp} no encontrada")
            compatibilidades.append(comp)

        animal = Animal(
            nombre=data.get("nombre"),
            tipo=data.get("tipo"),
            genero=data.get("genero"),
            tamanio=data.get("tamanio"),
            raza=data.get("raza"),
            colores=data.get("colores"),
            fecha_nacimiento=data.get("fecha_nacimiento"),
            fecha_ingreso=data.get("fecha_ingreso"),
            info_adicional=data.get("info_adicional"),
            comportamiento=data.get("comportamiento"),
            esterilizado=data.get("esterilizado"),
            url_imagen=data.get("url_imagen"),
        )

        animal.estados = estados
        animal.compatibilidades = compatibilidades

        db.session.add(animal)
        db.session.flush()

        for id_persona in data.get("voluntarios") or []:
            persona = Persona.query.get(id_persona)
            if not persona:
                raise LookupError(f"Persona con id {id_persona} no encontrada")
            db.session.add(AnimalPersona(animal_id=animal.id_animal, persona_id=id_persona, rol_id=roles["voluntario"]))

        if data.get("hogar_transito"):
            persona = Persona.query.get(data["hogar_transito"])
            if not persona:
                raise LookupError(f"Persona con id {data['hogar_transito']} no encontrada")
            db.session.add(AnimalPersona(animal_id=animal.id_animal, persona_id=data["hogar_transito"], rol_id=roles["hogar_transito"]))

        if data.get("adoptante"):
            persona = Persona.query.get(data["adoptante"])
            if not persona:
                raise LookupError(f"Persona con id {data['adoptante']} no encontrada")
            db.session.add(AnimalPersona(animal_id=animal.id_animal, persona_id=data["adoptante"], rol_id=roles["adoptante"]))

        db.session.commit()

        animales_personas = AnimalPersona.query.filter_by(animal_id=animal.id_animal).all()

        return {
            "id_animal": animal.id_animal,
            "nombre": animal.nombre,
            "tipo": animal.tipo,
            "genero": animal.genero,
            "tamanio": animal.tamanio,
            "raza": animal.raza,
            "colores": animal.colores,
            "fecha_nacimiento": str(animal.fecha_nacimiento) if animal.fecha_nacimiento else None,
            "fecha_ingreso": str(animal.fecha_ingreso),
            "info_adicional": animal.info_adicional,
            "comportamiento": animal.comportamiento,
            "esterilizado": animal.esterilizado,
            "url_imagen": animal.url_imagen,
            "estados": [e.id_estado for e in animal.estados],
            "compatibilidades": [c.id_compatibilidad for c in animal.compatibilidades],
            "voluntarios": [ap.persona_id for ap in animales_personas if ap.rol_id == roles["voluntario"]],
            "hogar_transito": next((ap.persona_id for ap in animales_personas if ap.rol_id == roles["hogar_transito"]), None),
            "adoptante": next((ap.persona_id for ap in animales_personas if ap.rol_id == roles["adoptante"]), None),
        }

    @staticmethod
    def get_all_animales(tipo=None, estado_id=None):
        if tipo and tipo not in TIPOS_VALIDOS:
            raise ValueError(f"Tipo inválido. Valores permitidos: {', '.join(TIPOS_VALIDOS)}")

        if estado_id is not None:
            estado_id = int(estado_id)
            estado = Estado.query.get(estado_id)
            if not estado:
                raise LookupError(f"Estado con id {estado_id} no encontrado")

        query = Animal.query.options(joinedload(Animal.estados))

        if tipo:
            query = query.filter(Animal.tipo == tipo)

        if estado_id:
            query = query.filter(Animal.estados.any(Estado.id_estado == estado_id))

        animales = query.all()

        return [
            {
                "id_animal": a.id_animal,
                "nombre": a.nombre,
                "url_imagen": a.url_imagen,
                "estados": [{"id_estado": e.id_estado, "nombre": e.nombre} for e in a.estados],
                "tipo": a.tipo
            }
            for a in animales
        ]

    @staticmethod
    def get_animal(animal_id):
        animal = Animal.query.get(animal_id)
        print(f"Buscando animal con id: {animal_id}, resultado: {animal}")
        if not animal:
            raise LookupError(f"Animal con id {animal_id} no encontrado")

        roles = {r.nombre: r.id_rol for r in Rol.query.filter(Rol.nombre.in_(ROLES_VALIDOS)).all()}
        animales_personas = AnimalPersona.query.filter_by(animal_id=animal.id_animal).all()

        voluntario_ids = [ap.persona_id for ap in animales_personas if ap.rol_id == roles["voluntario"]]
        voluntarios = []
        for pid in voluntario_ids:
            p = Persona.query.get(pid)
            voluntarios.append({"id_persona": p.id_persona, "nombre": p.nombre, "apellido": p.apellido})

        hogar_transito_id = next((ap.persona_id for ap in animales_personas if ap.rol_id == roles["hogar_transito"]), None)
        hogar_transito = None
        if hogar_transito_id:
            p = Persona.query.get(hogar_transito_id)
            hogar_transito = {"id_persona": p.id_persona, "nombre": p.nombre, "apellido": p.apellido}

        adoptante_id = next((ap.persona_id for ap in animales_personas if ap.rol_id == roles["adoptante"]), None)
        adoptante = None
        if adoptante_id:
            p = Persona.query.get(adoptante_id)
            adoptante = {"id_persona": p.id_persona, "nombre": p.nombre, "apellido": p.apellido}

        return {
            "id_animal": animal.id_animal,
            "nombre": animal.nombre,
            "tipo": animal.tipo,
            "genero": animal.genero,
            "tamanio": animal.tamanio,
            "raza": animal.raza,
            "colores": animal.colores,
            "fecha_nacimiento": str(animal.fecha_nacimiento) if animal.fecha_nacimiento else None,
            "fecha_ingreso": str(animal.fecha_ingreso),
            "info_adicional": animal.info_adicional,
            "comportamiento": animal.comportamiento,
            "esterilizado": animal.esterilizado,
            "url_imagen": animal.url_imagen,
            "estados": [{"id_estado": e.id_estado, "nombre": e.nombre} for e in animal.estados],
            "compatibilidades": [{"id_compatibilidad": c.id_compatibilidad, "nombre": c.nombre} for c in animal.compatibilidades],
            "voluntarios": voluntarios,
            "hogar_transito": hogar_transito,
            "adoptante": adoptante,
        }

    @staticmethod
    def update_animal(animal_id, data):
        animal = Animal.query.get(animal_id)
        if not animal:
            raise LookupError(f"Animal con id {animal_id} no encontrado")

        if "tipo" in data and data["tipo"] not in TIPOS_VALIDOS:
            raise ValueError(f"Tipo inválido. Valores permitidos: {', '.join(TIPOS_VALIDOS)}")

        if "genero" in data and data["genero"] not in GENEROS_VALIDOS:
            raise ValueError(f"Género inválido. Valores permitidos: {', '.join(GENEROS_VALIDOS)}")

        if "tamanio" in data and data["tamanio"] not in TAMANIOS_VALIDOS:
            raise ValueError(f"Tamaño inválido. Valores permitidos: {', '.join(TAMANIOS_VALIDOS)}")

        if "nombre" in data:
            animal.nombre = data["nombre"]
        if "tipo" in data:
            animal.tipo = data["tipo"]
        if "genero" in data:
            animal.genero = data["genero"]
        if "tamanio" in data:
            animal.tamanio = data["tamanio"]
        if "raza" in data:
            animal.raza = data["raza"]
        if "colores" in data:
            animal.colores = data["colores"]
        if "fecha_nacimiento" in data:
            animal.fecha_nacimiento = data["fecha_nacimiento"]
        if "fecha_ingreso" in data:
            animal.fecha_ingreso = data["fecha_ingreso"]
        if "info_adicional" in data:
            animal.info_adicional = data["info_adicional"]
        if "comportamiento" in data:
            animal.comportamiento = data["comportamiento"]
        if "esterilizado" in data:
            animal.esterilizado = data["esterilizado"]
        if "url_imagen" in data:
            animal.url_imagen = data["url_imagen"]

        roles = {r.nombre: r.id_rol for r in Rol.query.filter(Rol.nombre.in_(ROLES_VALIDOS)).all()}

        if "estados" in data:
            estados = []
            for id_estado in data["estados"] or []:
                estado = Estado.query.get(id_estado)
                if not estado:
                    raise LookupError(f"Estado con id {id_estado} no encontrado")
                estados.append(estado)
            animal.estados = estados

        if "compatibilidades" in data:
            compatibilidades = []
            for id_comp in data["compatibilidades"] or []:
                comp = Compatibilidad.query.get(id_comp)
                if not comp:
                    raise LookupError(f"Compatibilidad con id {id_comp} no encontrada")
                compatibilidades.append(comp)
            animal.compatibilidades = compatibilidades

        if "hogar_transito" in data:
            rol_id = roles["hogar_transito"]
            AnimalPersona.query.filter_by(animal_id=animal.id_animal, rol_id=rol_id).delete()
            if data["hogar_transito"]:
                persona = Persona.query.get(data["hogar_transito"])
                if not persona:
                    raise LookupError(f"Persona con id {data['hogar_transito']} no encontrada")
                db.session.add(AnimalPersona(animal_id=animal.id_animal, persona_id=data["hogar_transito"], rol_id=rol_id))

        if "adoptante" in data:
            rol_id = roles["adoptante"]
            AnimalPersona.query.filter_by(animal_id=animal.id_animal, rol_id=rol_id).delete()
            if data["adoptante"]:
                persona = Persona.query.get(data["adoptante"])
                if not persona:
                    raise LookupError(f"Persona con id {data['adoptante']} no encontrada")
                db.session.add(AnimalPersona(animal_id=animal.id_animal, persona_id=data["adoptante"], rol_id=rol_id))

        if "voluntarios" in data:
            rol_id = roles["voluntario"]
            AnimalPersona.query.filter_by(animal_id=animal.id_animal, rol_id=rol_id).delete()
            for id_persona in data["voluntarios"] or []:
                persona = Persona.query.get(id_persona)
                if not persona:
                    raise LookupError(f"Persona con id {id_persona} no encontrada")
                db.session.add(AnimalPersona(animal_id=animal.id_animal, persona_id=id_persona, rol_id=rol_id))

        db.session.commit()

    @staticmethod
    def delete_animal(animal_id):
        animal = Animal.query.get(animal_id)
        if not animal:
            raise LookupError(f"Animal con id {animal_id} no encontrado")

        db.session.delete(animal)
        db.session.commit()