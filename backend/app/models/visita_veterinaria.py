from app.extensions import db

class VisitaVeterinaria(db.Model):
    __tablename__ = "visitas_veterinarias"

    id_visita      = db.Column(db.Integer, primary_key=True)
    fecha          = db.Column(db.Date, nullable=False)
    estado         = db.Column(db.String, nullable=False)
    procedimiento  = db.Column(db.Text, nullable=False)
    info_adicional = db.Column(db.Text)
    costo          = db.Column(db.Numeric)
    animal_id      = db.Column(db.Integer,db.ForeignKey("animales.id_animal", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    veterinario_id = db.Column(db.Integer, db.ForeignKey("personas.id_persona"), nullable=False)

    animal       = db.relationship("Animal", back_populates="visitas")
    veterinario  = db.relationship("Persona", back_populates="visitas_veterinarias")
    tratamientos = db.relationship("Tratamiento", back_populates="visita", cascade="all, delete-orphan")