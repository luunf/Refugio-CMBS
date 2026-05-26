from app.extensions import db

class AnimalEstado(db.Model):
    __tablename__ = "animales_estados"
    __table_args__ = (db.UniqueConstraint("animal_id", "estado_id", name="uq_animal_estado"),)

    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey("animales.id_animal", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    estado_id = db.Column(db.Integer, db.ForeignKey("estados.id_estado", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)


class AnimalCompatibilidad(db.Model):
    __tablename__ = "animales_compatibilidades"
    __table_args__ = (db.UniqueConstraint("animal_id", "compatibilidad_id", name="uq_animal_compatibilidad"),)

    id = db.Column(db.Integer, primary_key=True)
    animal_id = db.Column(db.Integer, db.ForeignKey("animales.id_animal", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    compatibilidad_id = db.Column(db.Integer, db.ForeignKey("compatibilidades.id_compatibilidad", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)


class AnimalPersona(db.Model):
    __tablename__ = "animales_personas"
    __table_args__ = (db.UniqueConstraint("animal_id", "persona_id", name="uq_animal_persona"),)

    id = db.Column(db.Integer, primary_key=True)
    animal_id  = db.Column(db.Integer, db.ForeignKey("animales.id_animal", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    persona_id = db.Column(db.Integer, db.ForeignKey("personas.id_persona", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)


class PersonaRol(db.Model):
    __tablename__ = "personas_roles"
    __table_args__ = (db.UniqueConstraint("persona_id", "rol_id", name="uq_persona_rol"),)

    id = db.Column(db.Integer, primary_key=True)
    persona_id = db.Column(db.Integer, db.ForeignKey("personas.id_persona", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    rol_id = db.Column(db.Integer, db.ForeignKey("roles.id_rol", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)


class TareaPersona(db.Model):
    __tablename__ = "tareas_personas"
    __table_args__ = (db.UniqueConstraint("tarea_id", "persona_id", name="uq_tarea_persona"),)

    id = db.Column(db.Integer, primary_key=True)
    tarea_id = db.Column(db.Integer, db.ForeignKey("tareas.id_tarea", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)
    persona_id = db.Column(db.Integer, db.ForeignKey("personas.id_persona", ondelete="CASCADE", onupdate="CASCADE"), nullable=False)