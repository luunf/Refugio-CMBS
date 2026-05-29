from app.extensions import db

class Usuario(db.Model):
    __tablename__ = "usuarios"

    id_usuario = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String, nullable=False, unique=True)
    firebase_uid = db.Column(db.String, nullable=False, unique=True)
    tipo = db.Column(db.String, nullable=False)
    activo = db.Column(db.Boolean,default=True)
    
    persona_id = db.Column(db.Integer, db.ForeignKey("personas.id_persona", ondelete="CASCADE", onupdate="CASCADE"), nullable=False, unique=True)

    persona = db.relationship("Persona", back_populates="usuario")