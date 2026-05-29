from app.extensions import db
from app.models import Usuario, Persona
from app.models.rol import Rol


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
                "activo": u.activo,

                "persona": {
                    "id_persona": u.persona.id_persona,
                    "nombre": u.persona.nombre,
                    "apellido": u.persona.apellido,
                    "telefono": u.persona.telefono,
                    "direccion": u.persona.direccion,
                    "email": u.persona.email
                }
            })

        return result

    @staticmethod
    def crear_usuario(data):

        email = data.get("email")
        firebase_uid = data.get("firebase_uid")

        tipo = data.get("tipo", "estandar")

        if not email or not firebase_uid:

            raise Exception(
                "Faltan campos requeridos"
            )

        existing_usuario = Usuario.query.filter_by(
            email=email
        ).first()

        if existing_usuario:

            raise Exception(
                "El email ya está registrado"
            )

        existing_persona = Persona.query.filter_by(
            email=email
        ).first()

        if existing_persona:

            raise Exception(
                "Ya existe una persona con ese email"
            )

        # PERSONA MINIMA
        persona = Persona(
            email=email
        )

        db.session.add(persona)
        db.session.flush()

        # ROL VOLUNTARIO AUTOMATICO
        rol_voluntario = Rol.query.filter_by(
            nombre="voluntario"
        ).first()

        if rol_voluntario:
            persona.roles.append(rol_voluntario)

        # USUARIO
        usuario = Usuario(
            email=email,
            firebase_uid=firebase_uid,
            tipo=tipo,
            activo=True,
            persona_id=persona.id_persona
        )

        db.session.add(usuario)

        db.session.commit()

        return usuario

    @staticmethod
    def eliminar_usuario(usuario_id):

        usuario = Usuario.query.get(usuario_id)

        if not usuario:

            raise Exception(
                "Usuario no encontrado"
            )

        db.session.delete(usuario)

        db.session.commit()

        return True