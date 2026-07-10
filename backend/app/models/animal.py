from app.extensions import db

class Animal(db.Model):
    __tablename__ = "animales"

    id_animal = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String, nullable=False)
    tipo = db.Column(db.String, nullable=False)
    genero = db.Column(db.String, nullable=False)
    tamanio = db.Column(db.String, nullable=False)
    raza = db.Column(db.String)
    colores = db.Column(db.Text)
    fecha_nacimiento = db.Column(db.Date)
    fecha_ingreso = db.Column(db.Date, nullable=False)
    info_adicional = db.Column(db.Text)
    comportamiento = db.Column(db.Text)
    esterilizado = db.Column(db.Boolean, nullable=False, default=False)
    url_imagen = db.Column(db.String)

    estados = db.relationship("Estado", secondary="animales_estados", back_populates="animales")
    compatibilidades = db.relationship("Compatibilidad", secondary="animales_compatibilidades", back_populates="animales")
    personas = db.relationship("Persona", secondary="animales_personas", back_populates="animales")
    visitas = db.relationship("VisitaVeterinaria", back_populates="animal", cascade="all, delete-orphan")
    vacunas = db.relationship("Vacuna", back_populates="animal", cascade="all, delete-orphan")
    historial_estados = db.relationship("HistorialEstado", back_populates="animal", cascade="all, delete-orphan")