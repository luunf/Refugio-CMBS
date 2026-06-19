import requests

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


def enviar_push_asignacion(persona, tarea):
    _enviar_push(
        persona,
        "Nueva tarea asignada",
        f"Se te asignó: {tarea.nombre}"
    )


def enviar_push_modificacion(persona, tarea):
    _enviar_push(
        persona,
        "Tarea modificada",
        f"Se modificó: {tarea.nombre}"
    )


def _enviar_push(persona, titulo, cuerpo):

    print("\n========== PUSH ==========")

    print("PERSONA:")
    print(persona.id_persona)

    if not persona.usuario:

        print("NO TIENE USUARIO ASOCIADO")

        return

    print("USUARIO:")
    print(persona.usuario.id_usuario)

    if not persona.usuario.expo_push_token:

        print("NO TIENE TOKEN")

        return

    print("TOKEN:")
    print(persona.usuario.expo_push_token)

    payload = {
        "to": persona.usuario.expo_push_token,
        "title": titulo,
        "body": cuerpo,
        "sound": "default",
    }

    print("PAYLOAD:")
    print(payload)

    try:

        response = requests.post(
            EXPO_PUSH_URL,
            json=payload,
            timeout=5
        )

        print("STATUS CODE:")
        print(response.status_code)

        print("RESPUESTA EXPO:")
        print(response.text)

    except Exception as e:

        print("ERROR EN PUSH:")
        print(e)

    print("==========================\n")