import os
import firebase_admin
from firebase_admin import credentials, auth
from flask import current_app

class FirebaseService:
    _initialized = False  # Atributo de clase

    @classmethod
    def initialize(cls, app):
        if not cls._initialized:
            cred_path = app.config.get('FIREBASE_CREDENTIALS_PATH')
            if not cred_path:
                raise ValueError("FIREBASE_CREDENTIALS_PATH no configurado")
            
            # Si la ruta no es absoluta, la hacemos absoluta respecto al directorio actual
            if not os.path.isabs(cred_path):
                cred_path = os.path.join(os.getcwd(), cred_path)
            
            if not os.path.exists(cred_path):
                raise FileNotFoundError(f"Firebase credentials not found at {cred_path}")
            
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            cls._initialized = True

    @staticmethod
    def verify_token(id_token):
        try:
            decoded_token = auth.verify_id_token(id_token)
            return decoded_token
        except Exception as e:
            return None

    @staticmethod
    def create_user(email, password):
        try:
            user = auth.create_user(email=email, password=password)
            return user.uid
        except Exception as e:
            raise Exception(f"Error creating Firebase user: {str(e)}")

    @staticmethod
    def delete_user(uid):
        try:
            auth.delete_user(uid)
            return True
        except Exception as e:
            raise Exception(f"Error deleting Firebase user: {str(e)}")