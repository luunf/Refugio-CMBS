from app.extensions import db

class Tarea(db.Model):
    __tablename__ = "tareas"

    id_tarea = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String, nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    hora = db.Column(db.Time)
    es_todo_el_dia = db.Column(db.Boolean, nullable=False, default=False)
    completada = db.Column(db.Boolean, nullable=False, default=False)
    visita_id = db.Column(db.Integer, db.ForeignKey("visitas_veterinarias.id_visita", ondelete="CASCADE", onupdate="CASCADE"), nullable=True)
    descripcion = db.Column(db.Text, nullable=True)
    tratamiento_id = db.Column(db.Integer, db.ForeignKey("tratamientos.id_tratamiento", ondelete="CASCADE"), nullable=True)

    personas = db.relationship("Persona", secondary="tareas_personas", back_populates="tareas")
    visita = db.relationship("VisitaVeterinaria", back_populates="tarea")
    tratamiento = db.relationship("Tratamiento", back_populates="tareas")

    def to_dict(self):                        
        return {
            "id_tarea": self.id_tarea,
            "nombre": self.nombre,
            "fecha": str(self.fecha),
            "hora": str(self.hora) if self.hora else None,
            "es_todo_el_dia": self.es_todo_el_dia,
            "completada": self.completada,
            "descripcion": self.descripcion,
            "tratamiento_id": self.tratamiento_id,
            "personas": [
                {
                    "id_persona": p.id_persona,
                    "nombre": p.nombre,
                    "apellido": p.apellido,
                    "email": p.email
                }
                for p in self.personas
            ],
        }