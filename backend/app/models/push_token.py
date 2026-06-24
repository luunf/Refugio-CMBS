from app.extensions import db
from datetime import datetime, timezone


class PushToken(db.Model):
    """
    Almacena los Expo Push Tokens por usuario y dispositivo.
    Un usuario puede tener tokens en varios dispositivos simultáneamente.
    """
    __tablename__ = "push_tokens"

    id_token = db.Column(db.Integer, primary_key=True)

    id_usuario = db.Column(
        db.Integer,
        db.ForeignKey("usuarios.id_usuario", ondelete="CASCADE"),
        nullable=False,
    )

    token = db.Column(db.String(255), unique=True, nullable=False)
    activo = db.Column(db.Boolean, default=True, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    usuario = db.relationship("Usuario", backref=db.backref("push_tokens", lazy=True))

    def __repr__(self):
        return f"<PushToken id_usuario={self.id_usuario} activo={self.activo}>"