from app.extensions import db

class Tratamiento(db.Model):
    __tablename__ = "tratamientos"

    id_tratamiento = db.Column(db.Integer, primary_key=True)
    tipo           = db.Column(db.String, nullable=False)
    descripcion    = db.Column(db.Text)
    fecha_inicio   = db.Column(db.Date, nullable=False)
    fecha_fin      = db.Column(db.Date)
    frecuencia_horas = db.Column(db.Integer, nullable=True)
    hora_administracion = db.Column(db.Time, nullable=True)
    visita_id      = db.Column(db.Integer, db.ForeignKey("visitas_veterinarias.id_visita", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)

    tareas = db.relationship("Tarea", back_populates="tratamiento", cascade="all, delete-orphan")
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
            "frecuencia_horas": self.frecuencia_horas,
            "hora_administracion": self.hora_administracion.strftime("%H:%M") if self.hora_administracion else None,
            "visita_id": self.visita_id,
            "animal_nombre": animal_nombre,
            "especie": especie,
        }