from app.extensions import db
from app.models import Usuario, Persona
from app.models.rol import Rol
from firebase_admin import auth

from app.utils.email import enviar_email_verificacion


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
        password = data.get("password")
        tipo = data.get("tipo", "estandar")
        persona_id = data.get("persona_id")

        if not email:
            raise Exception(
                "Email obligatorio"
            )

        if not password:
            raise Exception(
                "Contraseña obligatoria"
            )

        if len(password) < 6:
            raise Exception(
                "La contraseña debe tener al menos 6 caracteres"
            )

        existing_usuario = Usuario.query.filter_by(
            email=email
        ).first()

        if existing_usuario:
            raise Exception(
                "El email ya existe"
            )

        firebase_user = auth.create_user(
            email=email,
            password=password
        )

        auth.update_user(
            firebase_user.uid,
            email_verified=False
        )

        link = auth.generate_email_verification_link(
            email
        )

        enviar_email_verificacion(
            email,
            link
        )

        # PERSONA EXISTENTE
        if persona_id:

            persona = Persona.query.get(
                persona_id
            )

            if not persona:
                raise Exception(
                    "Persona no encontrada"
                )

            usuario_existente = Usuario.query.filter_by(
                persona_id=persona.id_persona
            ).first()

            if usuario_existente:
                raise Exception(
                    "La persona ya tiene usuario"
                )

        # PERSONA NUEVA
        else:

            persona = Persona(
                email=email
            )

            db.session.add(persona)
            db.session.flush()

            rol_voluntario = Rol.query.filter_by(
                nombre="voluntario"
            ).first()

            if rol_voluntario:
                persona.roles.append(
                    rol_voluntario
                )

        usuario = Usuario(
            email=email,
            firebase_uid=firebase_user.uid,
            tipo=tipo,
            activo=True,
            persona_id=persona.id_persona
        )

        db.session.add(usuario)

        db.session.commit()

        return usuario

    @staticmethod
    def eliminar_usuario(
        usuario_id,
        eliminar_persona=False
    ):

        usuario = Usuario.query.get(
            usuario_id
        )

        if not usuario:
            raise Exception(
                "Usuario no encontrado"
            )

        # borrar en Firebase
        try:

            auth.delete_user(
                usuario.firebase_uid
            )

        except Exception as e:

            raise Exception(
                f"Firebase: {str(e)}"
            )
        persona = usuario.persona

        db.session.delete(usuario)

        db.session.flush()

        if eliminar_persona and persona:
            print(
                "ELIMINANDO PERSONA:",
                persona.id_persona
            )
            try:
                db.session.delete(persona)
            except Exception as e:
                print(
                    "ERROR ELIMINANDO PERSONA:",
                    e
                )

        db.session.commit()

        return True

    
    @staticmethod
    def get_usuario_by_id(usuario_id):
        return Usuario.query.get(usuario_id)
    
    @staticmethod
    def get_usuario(usuario_id):

        usuario = Usuario.query.get(usuario_id)

        if not usuario:
            return None

        return {
            "id_usuario": usuario.id_usuario,
            "email": usuario.email,
            "tipo": usuario.tipo,
            "activo": usuario.activo,

            "persona": {
                "id_persona": usuario.persona.id_persona,
                "nombre": usuario.persona.nombre,
                "apellido": usuario.persona.apellido,
                "telefono": usuario.persona.telefono,
                "direccion": usuario.persona.direccion,
                "email": usuario.persona.email
            }
        }
    @staticmethod
    def update_usuario(usuario_id, data):

        usuario = Usuario.query.get(
            usuario_id
        )

        if not usuario:
            raise Exception(
                "Usuario no encontrado"
            )

        tipo = data.get("tipo")
        activo = data.get("activo")

        if tipo:
            usuario.tipo = tipo

        if activo is not None:
            usuario.activo = activo
            try:
                auth.update_user(
                    usuario.firebase_uid,
                    disabled=not activo
                )
            except Exception as e:
                print(
                    f"[Firebase] Error al actualizar estado: {e}"
                )

        db.session.commit()

        return usuario
    @staticmethod
    def reenviar_verificacion(usuario_id):

        usuario = Usuario.query.get(usuario_id)

        if not usuario:
            raise Exception(
                "Usuario no encontrado"
            )

        firebase_user = auth.get_user(
            usuario.firebase_uid
        )

        if firebase_user.email_verified:
            raise Exception(
                "El email ya fue verificado"
            )

        try:

            link = auth.generate_email_verification_link(
                usuario.email
            )

            enviar_email_verificacion(
                usuario.email,
                link
            )

            return True

        except Exception as e:

            if "TOO_MANY_ATTEMPTS_TRY_LATER" in str(e):
                raise Exception(
                    "Ya se envió un correo de verificación recientemente. Espere unos minutos antes de solicitar otro."
                )

            raise e