import os
from dotenv import load_dotenv

load_dotenv()


class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv('url_bdd')
    SQLALCHEMY_TRACK_MODIFICATIONS = False