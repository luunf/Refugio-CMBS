from flask import Flask
from flask_cors import CORS
from app.extensions import db, cors, migrate, mail
from app.config import Config
from app.services.firebase_service import FirebaseService
from app.utils.error_handlers import register_error_handlers

# Blueprints
from app.routes.tareas import tareas_bp
from app.routes.auth_routes import auth_bp
from app.routes.usuario_routes import usuario_bp
from app.routes.persona_routes import persona_bp
from app.routes.rol_routes import rol_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Inicializar extensiones
    CORS(app)
    db.init_app(app)
    cors.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)

    # Inicializar Firebase (comenta si no tienes credenciales aún)
    FirebaseService.initialize(app)

    # Registrar blueprints
    app.register_blueprint(tareas_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix='/auth')
    app.register_blueprint(usuario_bp, url_prefix='/usuarios')
    app.register_blueprint(persona_bp, url_prefix='/personas')
    app.register_blueprint(rol_bp, url_prefix='/roles')

    register_error_handlers(app)

    # Crear tablas y roles por defecto
    with app.app_context():
        db.create_all()
        from app.models.rol import Rol
        roles_default = ['voluntario', 'veterinario', 'hogar_transito', 'adoptante']
        for rol_nombre in roles_default:
            if not Rol.query.filter_by(nombre=rol_nombre).first():
                db.session.add(Rol(nombre=rol_nombre))
        db.session.commit()

    return app