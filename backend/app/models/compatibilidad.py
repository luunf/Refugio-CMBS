from app.extensions import db

class Compatibilidad(db.Model):
    __tablename__ = "compatibilidades"

    id_compatibilidad = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String, nullable=False, unique=True)

    animales = db.relationship("Animal", secondary="animales_compatibilidades", back_populates="compatibilidades")