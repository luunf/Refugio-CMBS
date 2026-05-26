import firebase_admin
from firebase_admin import credentials
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

firebase_path = os.path.join(BASE_DIR, 'firebase-key.json')

cred = credentials.Certificate(firebase_path)

firebase_admin.initialize_app(cred)