from app.extensions import db

class Rol(db.Model):
    __tablename__ = "roles"

    id_rol = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String, nullable=False, unique=True)

    personas = db.relationship("Persona", secondary="personas_roles", back_populates="roles")