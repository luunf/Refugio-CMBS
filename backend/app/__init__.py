from flask import Flask
from .extensions import db, migrate
from flask_cors import CORS
from .config import Config
from .firebase_config import *

def create_app():
    app = Flask(__name__)

    app.config.from_object(Config)

    CORS(app)

    db.init_app(app)
    migrate.init_app(app, db)

    with app.app_context():
        from app import models

    return app