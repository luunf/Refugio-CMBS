from app.extensions import db

class Tarea(db.Model):
    __tablename__ = "tareas"

    id_tarea = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String, nullable=False)
    fecha = db.Column(db.Date, nullable=False)
    hora = db.Column(db.Time)
    es_todo_el_dia = db.Column(db.Boolean, nullable=False, default=False)
    completada = db.Column(db.Boolean, nullable=False, default=False)

    personas = db.relationship("Persona", secondary="tareas_personas", back_populates="tareas")