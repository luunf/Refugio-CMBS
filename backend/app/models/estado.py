from app.extensions import db

class Estado(db.Model):
    __tablename__ = "estados"

    id_estado = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String, nullable=False, unique=True)

    animales = db.relationship("Animal", secondary="animales_estados", back_populates="estados")