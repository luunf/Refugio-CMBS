from app.extensions import db

class Vacuna(db.Model):
    __tablename__ = "vacunas"

    id_vacuna = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String, nullable=False)
    fecha_aplicacion = db.Column(db.Date)
    requiere_prox_dosis = db.Column(db.Boolean, nullable=False, default=False)
    fecha_prox_dosis = db.Column(db.Date)
    costo_aplicacion = db.Column(db.Numeric)
    animal_id = db.Column(db.Integer, db.ForeignKey("animales.id_animal", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

    animal = db.relationship("Animal", back_populates="vacunas")