# app/services/usuario_service.py

from app.extensions import db
from app.models import Usuario, Persona, Rol


class UsuarioService:

    @staticmethod
    def get_usuario_by_firebase_uid(firebase_uid):

        return Usuario.query.filter_by(
            firebase_uid=firebase_uid
        ).first()

    @staticmethod
    def get_usuario_by_persona_id(persona_id):

        return Usuario.query.filter_by(
            persona_id=persona_id
        ).first()

    @staticmethod
    def get_all_usuarios():

        usuarios = Usuario.query.all()

        result = []

        for u in usuarios:

            result.append({
                "id_usuario": u.id_usuario,
                "email": u.email,
                "tipo": u.tipo,

                "persona": {
                    "id_persona": u.persona.id_persona,
                    "nombre": u.persona.nombre,
                    "apellido": u.persona.apellido
                }
            })

        return result

    @staticmethod
    def crear_usuario(
        email,
        firebase_uid,
        tipo,
        roles
    ):

        existing_email = Usuario.query.filter_by(
            email=email
        ).first()

        if existing_email:
            raise Exception(
                "El email ya está registrado"
            )

        persona = Persona(
            nombre="",
            apellido=""
        )

        db.session.add(persona)
        db.session.flush()

        usuario = Usuario(
            email=email,
            firebase_uid=firebase_uid,
            tipo=tipo,
            persona_id=persona.id_persona
        )

        db.session.add(usuario)

        for rol_id in roles:

            rol = Rol.query.get(rol_id)

            if rol:
                persona.roles.append(rol)

        db.session.commit()

        return usuario

    @staticmethod
    def eliminar_usuario(usuario_id):

        usuario = Usuario.query.get(usuario_id)

        if not usuario:
            raise Exception("Usuario no encontrado")

        db.session.delete(usuario)

        db.session.commit()

        return True