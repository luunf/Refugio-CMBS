from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_mail import Mail
from flask_cors import CORS

mail = Mail()
db = SQLAlchemy()
migrate = Migrate()
cors = CORS()