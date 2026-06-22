from app.models import (
    Rol,
    Estado,
    Compatibilidad,
    Persona,
    Usuario,
    PersonaRol
)
from firebase_admin import auth
from app.extensions import db


class SeedService:

    @staticmethod
    def run():

        SeedService._seed_roles()
        SeedService._seed_estados()
        SeedService._seed_compatibilidades()
        SeedService._seed_admin()

        db.session.commit()

    @staticmethod
    def _seed_roles():

        roles = [
            "voluntario",
            "veterinario",
            "hogar_transito",
            "adoptante"
        ]

        for nombre in roles:

            existe = Rol.query.filter_by(
                nombre=nombre
            ).first()

            if not existe:
                db.session.add(
                    Rol(nombre=nombre)
                )

    @staticmethod
    def _seed_estados():

        estados = [
            "En refugio",
            "En tránsito",
            "En tratamiento",
            "En adopción",
            "Adoptado"
        ]

        for nombre in estados:

            existe = Estado.query.filter_by(
                nombre=nombre
            ).first()

            if not existe:
                db.session.add(
                    Estado(nombre=nombre)
                )

    @staticmethod
    def _seed_compatibilidades():

        compatibilidades = [
            "Perros macho",
            "Perras hembra",
            "Gatos macho",
            "Gatas hembra",
            "Niños"
        ]

        for nombre in compatibilidades:

            existe = Compatibilidad.query.filter_by(
                nombre=nombre
            ).first()

            if not existe:
                db.session.add(
                    Compatibilidad(nombre=nombre)
                )

    @staticmethod
    def _seed_admin():

        email = "admin@refugiocmbs.com"

        try:

            firebase_user = auth.get_user_by_email(
                email
            )

            auth.update_user(
                firebase_user.uid,
                email_verified=True
            )

            print(
                f"[SEED] Admin verificado: {email}"
            )

        except auth.UserNotFoundError:

            print(
                f"[SEED] No existe el usuario {email} en Firebase."
            )

            return

        usuario = Usuario.query.filter_by(
            email=email
        ).first()

        if usuario:
            return

        persona = Persona.query.filter_by(
            email=email
        ).first()

        if not persona:

            persona = Persona(
                nombre="Administrador",
                apellido="Sistema",
                email=email,
                telefono="",
                direccion=""
            )

            db.session.add(persona)
            db.session.flush()

        usuario = Usuario(
            email=email,
            firebase_uid=firebase_user.uid,
            tipo="admin",
            activo=True,
            persona_id=persona.id_persona
        )

        db.session.add(usuario)

        rol_voluntario = Rol.query.filter_by(
            nombre="voluntario"
        ).first()

        if rol_voluntario:

            relacion = PersonaRol.query.filter_by(
                persona_id=persona.id_persona,
                rol_id=rol_voluntario.id_rol
            ).first()

            if not relacion:

                db.session.add(
                    PersonaRol(
                        persona_id=persona.id_persona,
                        rol_id=rol_voluntario.id_rol
                    )
                )

        print(
            f"[SEED] Admin creado: {email}"
        )