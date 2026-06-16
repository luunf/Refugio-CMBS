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

    def to_dict(self):
        animal_nombre = None
        especie = None

        if self.visita and self.visita.animal:
            animal_nombre = self.visita.animal.nombre
            especie = self.visita.animal.tipo

        return {
            "id": self.id_tratamiento,
            "tipo": self.tipo,
            "descripcion": self.descripcion,
            "fecha_inicio": str(self.fecha_inicio) if self.fecha_inicio else None,
            "fecha_fin": str(self.fecha_fin) if self.fecha_fin else None,
            "visita_id": self.visita_id,
            "animal_nombre": animal_nombre,
            "especie": especie,
        }