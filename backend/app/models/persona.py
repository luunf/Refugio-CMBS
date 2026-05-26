from app.extensions import db

class Persona(db.Model):
    __tablename__ = "personas"

    id_persona = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String)
    apellido = db.Column(db.String)
    telefono = db.Column(db.String)
    direccion = db.Column(db.String)
    email = db.Column(db.String, nullable=False, unique=True)

    roles = db.relationship("Rol", secondary="personas_roles", back_populates="personas")
    usuario = db.relationship("Usuario", back_populates="persona", uselist=False, cascade="all, delete-orphan")
    animales = db.relationship("Animal", secondary="animales_personas", back_populates="personas")
    visitas_veterinarias = db.relationship("VisitaVeterinaria", back_populates="veterinario")
    tareas = db.relationship("Tarea", secondary="tareas_personas", back_populates="personas")