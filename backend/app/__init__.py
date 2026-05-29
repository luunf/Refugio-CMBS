from flask import Flask
from flask_cors import CORS

from app.extensions import db, cors, migrate, mail
from app.config import Config
from app.services.firebase_service import FirebaseService
from app.utils.error_handlers import register_error_handlers

# Blueprints
from app.routes.tareas import tarea_bp
from app.routes.auth_routes import auth_bp
from app.routes.usuario_routes import usuario_bp
from app.routes.persona_routes import persona_bp
from app.routes.rol_routes import rol_bp


def create_app():
    app = Flask(__name__)

    # Configuración
    app.config.from_object(Config)

    # Extensiones
    CORS(app)

    db.init_app(app)
    cors.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)

    # Firebase
    FirebaseService.initialize(app)

    # Importar modelos
    with app.app_context():
        from app import models

    # Blueprints
    app.register_blueprint(tarea_bp, url_prefix="/tareas")
    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(usuario_bp, url_prefix="/usuarios")
    app.register_blueprint(persona_bp, url_prefix="/personas")
    app.register_blueprint(rol_bp, url_prefix="/roles")

    # Manejo de errores
    register_error_handlers(app)

    return app