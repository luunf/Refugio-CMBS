from datetime import date
from app.extensions import db

class HistorialEstado(db.Model):
    __tablename__ = "animales_estados_historial"

    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey("animales.id_animal", ondelete="CASCADE"), nullable=False)
    estado_id = db.Column(db.Integer, db.ForeignKey("estados.id_estado", ondelete="CASCADE"), nullable=False)
    persona_id = db.Column(db.Integer, db.ForeignKey("personas.id_persona"), nullable=True)
    fecha_desde = db.Column(db.Date, nullable=False, default=date.today)
    fecha_hasta = db.Column(db.Date, nullable=True)

    animal = db.relationship("Animal", back_populates="historial_estados")
    estado = db.relationship("Estado", back_populates="historial_estados")
    persona = db.relationship("Persona", back_populates="historial_estados")

    def to_dict(self):
        return {
            "id": self.id,
            "estado_id": self.estado_id,
            "estado_nombre": self.estado.nombre if self.estado else None,
            "fecha_desde": str(self.fecha_desde) if self.fecha_desde else None,
            "fecha_hasta": str(self.fecha_hasta) if self.fecha_hasta else None,
            "persona": {
                "id_persona": self.persona.id_persona,
                "nombre": self.persona.nombre,
                "apellido": self.persona.apellido,
            } if self.persona else None,
        }