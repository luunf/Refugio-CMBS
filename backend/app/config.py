import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('url_bdd')
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    FIREBASE_CREDENTIALS_PATH = os.getenv('FIREBASE_CREDENTIALS_PATH', 'firebasekey.json')
    #MAIL_SERVER = 'smtp.gmail.com'
    #MAIL_PORT = 587
    #MAIL_USE_TLS = True
    #MAIL_USERNAME = 'tu_correo@gmail.com'
    #MAIL_PASSWORD = 'tu_contraseña_de_aplicacion_de_google'