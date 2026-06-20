from flask_mail import Message
from app.extensions import mail

#funcione para mails 
def enviar_email_asignacion(persona, tarea):
    if not persona.email:
        return
    msg = Message(
        subject="Nueva tarea asignada",
        recipients=[persona.email],
        body=(
            f"Hola {persona.nombre},\n\n"
            f"Se te asignó la tarea '{tarea.nombre}' "
            f"para el {tarea.fecha}.\n\n"
            f"Refugio Corazones Vagabundos"
        )
    )
    mail.send(msg)

def enviar_email_modificacion(persona, tarea):
    if not persona.email:
        return
    msg = Message(
        subject="Tarea modificada",
        recipients=[persona.email],
        body=(
            f"Hola {persona.nombre},\n\n"
            f"La tarea '{tarea.nombre}' fue modificada.\n\n"
            f"Refugio Corazones Vagabundos"
        )
    )
    mail.send(msg)

def enviar_email_verificacion(email, link):

    msg = Message(
        subject="Verificá tu cuenta",
        recipients=[email],
        body=(
            "Hola.\n\n"
            "Para activar tu cuenta hacé click en el siguiente enlace:\n\n"
            f"{link}\n\n"
            "Refugio Corazones Vagabundos"
        )
    )

    mail.send(msg)