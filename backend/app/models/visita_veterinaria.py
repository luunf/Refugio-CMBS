from app.extensions import db

class VisitaVeterinaria(db.Model):
    
    __tablename__ = "visitas_veterinarias"

    id_visita      = db.Column(db.Integer, primary_key=True)
    fecha          = db.Column(db.Date, nullable=False)
    hora          = db.Column(db.Time)
    estado         = db.Column(db.String, nullable=False)
    procedimiento  = db.Column(db.Text, nullable=False)
    info_adicional = db.Column(db.Text)
    costo          = db.Column(db.Numeric)
    animal_id      = db.Column(db.Integer, db.ForeignKey("animales.id_animal", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    veterinario_id = db.Column(db.Integer, db.ForeignKey("personas.id_persona"), nullable=False)

    animal       = db.relationship("Animal", back_populates="visitas")
    veterinario  = db.relationship("Persona", back_populates="visitas_veterinarias")
    tratamientos = db.relationship("Tratamiento", back_populates="visita", cascade="all, delete-orphan")
    tarea        = db.relationship("Tarea", back_populates="visita", uselist=False, cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id_visita": self.id_visita,
            "fecha": str(self.fecha) if self.fecha else None,
            "hora": str(self.hora) if self.hora else None,
            "estado": self.estado,
            "procedimiento": self.procedimiento,
            "info_adicional": self.info_adicional,
            "costo": float(self.costo) if self.costo else None,
            "animal_id": self.animal_id,
            "veterinario_id": self.veterinario_id,
        }