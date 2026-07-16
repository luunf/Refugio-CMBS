from flask import request, jsonify

from app.services.notificaciones_service import NotificacionesService
from app.services.usuario_service import UsuarioService


def guardar_token(decoded_token):
    data = request.get_json()
    token_valor = (data or {}).get("token", "").strip()

    if not token_valor or not token_valor.startswith("ExponentPushToken"):
        return jsonify({"error": "Token de Expo inválido"}), 400

    firebase_uid = decoded_token.get("uid")
    usuario = UsuarioService.get_usuario_by_firebase_uid(firebase_uid)

    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    NotificacionesService.guardar_token(usuario, token_valor)

    return jsonify({"mensaje": "Token guardado"}), 200


def eliminar_token(decoded_token):
    data = request.get_json()
    token_valor = ((data or {}).get("token", "").strip())

    if not token_valor:
        return jsonify({"error": "Token requerido"}), 400

    NotificacionesService.eliminar_token(token_valor)

    return jsonify({"mensaje": "Token desactivado"}), 200


def test_push(decoded_token):
    firebase_uid = decoded_token.get("uid")
    usuario = UsuarioService.get_usuario_by_firebase_uid(firebase_uid)

    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    cantidad_tokens = NotificacionesService.enviar_push_test(usuario)

    return jsonify({"ok": True, "tokens": cantidad_tokens}), 200


def notificar_tratamiento_agendado_endpoint(decoded_token, tratamiento_id):
    from app.models.tratamiento import Tratamiento

    tratamiento = Tratamiento.query.get(tratamiento_id)
    if not tratamiento:
        return jsonify({"error": "Tratamiento no encontrado"}), 404

    NotificacionesService.notificar_tratamiento_agendado(tratamiento)

    return jsonify({
        "mensaje": "Notificación de agendado enviada",
        "tratamiento": tratamiento.tipo,
        "animal": tratamiento.visita.animal.nombre
    }), 200