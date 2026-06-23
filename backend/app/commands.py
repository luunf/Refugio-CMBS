from flask_migrate import upgrade

from app.services.seed_service import SeedService


def register_commands(app):

    @app.cli.command("setup-db")
    def setup_db():

        print("Ejecutando migraciones...")

        upgrade()

        print("Ejecutando seeds...")

        SeedService.run()

        print("Base de datos inicializada correctamente")