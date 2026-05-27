from flask import Flask
from .extensions import db, migrate
from flask_cors import CORS
from .config import Config
from .firebase_config import *
from app.extensions import mail
from app.routes.tareas import tareas_bp

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)
    db.init_app(app)
    migrate.init_app(app, db)
    mail.init_app(app)


    app.register_blueprint(tareas_bp, url_prefix="/api")
  
    with app.app_context():
        from app import models

    return app