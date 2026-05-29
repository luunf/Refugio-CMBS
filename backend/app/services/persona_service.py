# app/services/persona_service.py

from app.extensions import db
from app.models import Persona, Rol, Animal, Usuario
from sqlalchemy.orm import joinedload


class PersonaService:

    @staticmethod
    def get_all_personas(rol_nombre=None):

        query = Persona.query.options(
            joinedload(Persona.roles)
        )

        if rol_nombre:

            query = query.filter(
                Persona.roles.any(
                    Rol.nombre == rol_nombre
                )
            )

        personas = query.all()

        result = []

        for p in personas:

            result.append({
                "id_persona": p.id_persona,
                "nombre": p.nombre,
                "apellido": p.apellido,
                "telefono": p.telefono,
                "direccion": p.direccion,

                "email": (
                    p.usuario.email
                    if p.usuario else None
                ),

                "roles": [
                    {
                        "id_rol": r.id_rol,
                        "nombre": r.nombre
                    }
                    for r in p.roles
                ]
            })

        return result

    @staticmethod
    def get_persona_by_id(persona_id):

        persona = Persona.query.options(
            joinedload(Persona.roles)
        ).get(persona_id)

        if not persona:
            return None

        return {
            "id_persona": persona.id_persona,
            "nombre": persona.nombre,
            "apellido": persona.apellido,
            "telefono": persona.telefono,
            "direccion": persona.direccion,

            "email": (
                persona.usuario.email
                if persona.usuario else None
            ),

            "roles": [
                {
                    "id_rol": r.id_rol,
                    "nombre": r.nombre
                }
                for r in persona.roles
            ]
        }

    @staticmethod
    def get_personas_by_animal(animal_id):

        animal = Animal.query.get(animal_id)

        if not animal:
            raise Exception("Animal no encontrado")

        personas = animal.personas

        result = []

        for p in personas:

            result.append({
                "id_persona": p.id_persona,
                "nombre": p.nombre,
                "apellido": p.apellido,
                "telefono": p.telefono,
                "direccion": p.direccion,

                "email": (
                    p.usuario.email
                    if p.usuario else None
                ),

                "roles": [
                    {
                        "id_rol": r.id_rol,
                        "nombre": r.nombre
                    }
                    for r in p.roles
                ]
            })

        return result

    @staticmethod
    def crear_persona(data):

        persona = Persona(
            nombre=data.get("nombre"),
            apellido=data.get("apellido"),
            telefono=data.get("telefono"),
            direccion=data.get("direccion")
        )

        db.session.add(persona)
        db.session.flush()

        roles_ids = data.get("roles", [])

        for rol_id in roles_ids:

            rol = Rol.query.get(rol_id)

            if rol:
                persona.roles.append(rol)

        db.session.commit()

        return persona

    @staticmethod
    def actualizar_persona(persona_id, data):

        persona = Persona.query.get(persona_id)

        if not persona:
            raise Exception("Persona no encontrada")

        if "nombre" in data:
            persona.nombre = data["nombre"]

        if "apellido" in data:
            persona.apellido = data["apellido"]

        if "telefono" in data:
            persona.telefono = data["telefono"]

        if "direccion" in data:
            persona.direccion = data["direccion"]

        if "roles" in data:

            persona.roles.clear()

            for rol_id in data["roles"]:

                rol = Rol.query.get(rol_id)

                if rol:
                    persona.roles.append(rol)

        db.session.commit()

        return persona

    @staticmethod
    def eliminar_persona(persona_id):

        persona = Persona.query.get(persona_id)

        if not persona:
            raise Exception("Persona no encontrada")

        usuario = Usuario.query.filter_by(
            persona_id=persona_id
        ).first()

        if usuario:
            raise Exception(
                "No se puede eliminar la persona porque tiene un usuario asociado"
            )

        db.session.delete(persona)

        db.session.commit()

        return True