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
                    Rol.nombre.ilike(f"%{rol_nombre}%")
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
                    if p.usuario else p.email
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
                if persona.usuario else persona.email
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
                    if p.usuario else p.email
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

        email = data.get("email")

        if not email:
            raise Exception("El email es obligatorio")

        existing_persona = Persona.query.filter_by(email=email).first()

        if existing_persona:
            raise Exception("Ya existe una persona con ese email")

        persona = Persona(
            nombre=data.get("nombre"),
            apellido=data.get("apellido"),
            telefono=data.get("telefono"),
            direccion=data.get("direccion"),
            email=email
        )

        db.session.add(persona)
        db.session.flush()

        roles_ids = data.get("roles", [])

        if len(roles_ids) == 0:
            raise Exception(
                "Debe seleccionar al menos un rol"
            )

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

        if "email" in data:

            if persona.usuario and persona.usuario.activo:
                raise Exception(
                    "No se puede modificar el email porque tiene un usuario activo"
                )

            existing_persona = Persona.query.filter_by(
                email=data["email"]
            ).first()

            if existing_persona and existing_persona.id_persona != persona.id_persona:
                raise Exception("El email ya está registrado")

            persona.email = data["email"]

        if "nombre" in data:
            persona.nombre = data["nombre"]

        if "apellido" in data:
            persona.apellido = data["apellido"]

        if "telefono" in data:
            persona.telefono = data["telefono"]

        if "direccion" in data:
            persona.direccion = data["direccion"]

        if "roles" in data:

            persona.roles = []

            rol_voluntario = Rol.query.filter_by(
                nombre="voluntario"
            ).first()

            if rol_voluntario:
                persona.roles.append(
                    rol_voluntario
                )

            for rol_id in data["roles"]:

                rol = Rol.query.get(rol_id)

                if (
                    rol
                    and rol.nombre != "voluntario"
                    and rol not in persona.roles
                ):
                    persona.roles.append(rol)

            # si quedo sin roles, poner voluntario
            if not persona.roles:
                rol_voluntario = Rol.query.filter_by(nombre="voluntario").first()
                if rol_voluntario:
                    persona.roles.append(rol_voluntario)

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
        
        if persona.animales:  
            raise Exception(
                "No se puede eliminar la persona porque tiene animales asignados"
            )
        if persona.tareas: 
            raise Exception(
                "No se puede eliminar la persona porque tiene tareas asignadas"
            )
        
        if persona.visitas_veterinarias:
            raise Exception(
                "No se puede eliminar la persona porque tiene visitas veterinarias asociadas."
            )

        db.session.delete(persona)

        db.session.commit()

        return True
    
    @staticmethod
    def buscar_por_email(email):

        if not email:
            return None

        persona = Persona.query.filter_by(
            email=email
        ).first()

        if not persona:
            return None

        return {
            "id_persona": persona.id_persona,
            "nombre": persona.nombre,
            "apellido": persona.apellido,
            "email": persona.email,
            "telefono": persona.telefono,
            "direccion": persona.direccion,
            "tiene_usuario": persona.usuario is not None
        }