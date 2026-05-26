from app.extensions import db

class Tratamiento(db.Model):
    __tablename__ = "tratamientos"

    id_tratamiento = db.Column(db.Integer, primary_key=True)
    tipo           = db.Column(db.String, nullable=False)
    descripcion    = db.Column(db.Text)
    fecha_inicio   = db.Column(db.Date, nullable=False)
    fecha_fin      = db.Column(db.Date)
    visita_id      = db.Column(db.Integer, db.ForeignKey("visitas_veterinarias.id_visita", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

    visita = db.relationship("VisitaVeterinaria", back_populates="tratamientos")