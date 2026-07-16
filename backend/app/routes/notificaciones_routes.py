from flask import Blueprint

from app.utils.decorators import token_required
from app.controllers import notificaciones_controller as controller
from app.services.notificaciones_service import NotificacionesService

notificaciones_bp = Blueprint("notificaciones", __name__)

notificar_tarea_asignada = NotificacionesService.notificar_tarea_asignada
notificar_tarea_completada = NotificacionesService.notificar_tarea_completada
notificar_tarea_cancelada = NotificacionesService.notificar_tarea_cancelada
notificar_tratamiento_actualizado = NotificacionesService.notificar_tratamiento_actualizado
notificar_tratamiento_por_vencer = NotificacionesService.notificar_tratamiento_por_vencer
init_scheduler = NotificacionesService.init_scheduler


@notificaciones_bp.route("/token", methods=["POST"])
@token_required
def guardar_token(decoded_token):
    return controller.guardar_token(decoded_token)


@notificaciones_bp.route("/token", methods=["DELETE"])
@token_required
def eliminar_token(decoded_token):
    return controller.eliminar_token(decoded_token)


@notificaciones_bp.route("/test", methods=["POST"])
@token_required
def test_push(decoded_token):
    return controller.test_push(decoded_token)


@notificaciones_bp.route("/tratamiento-agendado/<int:tratamiento_id>", methods=["POST"])
@token_required
def notificar_tratamiento_agendado_endpoint(decoded_token, tratamiento_id):
    return controller.notificar_tratamiento_agendado_endpoint(decoded_token, tratamiento_id)