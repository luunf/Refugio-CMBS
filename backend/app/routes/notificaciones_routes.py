import logging
import requests
from datetime import datetime, timedelta, timezone

from flask import Blueprint, request, jsonify
from apscheduler.schedulers.background import BackgroundScheduler

from app.extensions import db
from app.models.push_token import PushToken
from app.utils.decorators import token_required
from app.services.usuario_service import UsuarioService
from app.models.usuario import Usuario

logger = logging.getLogger(__name__)

notificaciones_bp = Blueprint("notificaciones", __name__)

_scheduler = BackgroundScheduler(timezone="America/Argentina/Buenos_Aires")

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"


def _get_tokens_de_persona(id_persona: int) -> list[str]:
    usuarios = Usuario.query.filter_by(
        persona_id=id_persona,
        activo=True
    ).all()

    tokens = []
    for u in usuarios:
        for pt in u.push_tokens:
            if pt.activo:
                tokens.append(pt.token)

    return tokens


def _enviar_push(tokens: list[str], title: str, body: str, data: dict = None) -> None:
    tokens_validos = [t for t in tokens if t and t.startswith("ExponentPushToken")]
    if not tokens_validos:
        return

    mensajes = [
        {
            "to": token,
            "title": title,
            "body": body,
            "data": data or {},
            "priority": "high",
            "channelId": "tareas",
        }
        for token in tokens_validos
    ]

    try:
        resp = requests.post(
            EXPO_PUSH_URL,
            json=mensajes,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            timeout=8,
        )

        resp.raise_for_status()
        logger.info(f"[Push] {len(mensajes)} notificaciones enviadas OK")

    except requests.RequestException as e:
        logger.error(f"[Push] Error al enviar notificaciones: {e}")


# Funciones públicas — llamalas desde tus otras rutas
def notificar_tarea_asignada(tarea, personas_ids: list[int], asignado_por: str) -> None:
    for id_persona in personas_ids:
        tokens = _get_tokens_de_persona(id_persona)
        if tokens:
            _enviar_push(
                tokens=tokens,
                title="Nueva tarea asignada",
                body=f'{asignado_por} te asignó: "{tarea.nombre}"',
                data={
                    "id_tarea": tarea.id_tarea,
                    "tipo": "TAREA_ASIGNADA"
                },
            )


def notificar_tarea_completada(tarea, completada_por: str) -> None:
    for persona in tarea.personas:
        tokens = _get_tokens_de_persona(persona.id_persona)
        if tokens:
            _enviar_push(
                tokens=tokens,
                title="Tarea completada",
                body=f'"{tarea.nombre}" fue marcada como completada por {completada_por}',
                data={"id_tarea": tarea.id_tarea, "tipo": "TAREA_COMPLETADA"},
            )


def notificar_tarea_cancelada(tarea, cancelada_por: str) -> None:
    for persona in tarea.personas:
        tokens = _get_tokens_de_persona(persona.id_persona)
        if tokens:
            _enviar_push(
                tokens=tokens,
                title="Tarea cancelada",
                body=f'"{tarea.nombre}" fue cancelada por {cancelada_por}',
                data={"id_tarea": tarea.id_tarea, "tipo": "TAREA_CANCELADA"},
            )


# Job del scheduler — recordatorios de vencimiento
def _job_recordatorios_vencimiento(app) -> None:
    with app.app_context():
        from app.models.tarea import Tarea

        tz = timezone(timedelta(hours=-3))
        hoy = datetime.now(tz).date()
        manana = hoy + timedelta(days=1)

        tareas = Tarea.query.filter(
            Tarea.fecha == manana,
            Tarea.completada == False
        ).all()

        for tarea in tareas:
            for persona in tarea.personas:
                tokens = _get_tokens_de_persona(persona.id_persona)
                if tokens:
                    _enviar_push(
                        tokens=tokens,
                        title="Tarea por vencer",
                        body=f'"{tarea.nombre}" vence mañana. ¡No te olvides!',
                        data={"id_tarea": tarea.id_tarea, "tipo": "TAREA_POR_VENCER"},
                    )


# Notificaciones para TRATAMIENTOS
def notificar_tratamiento_actualizado(tratamiento) -> None:
    visita = tratamiento.visita
    animal = visita.animal
    
    personas_a_notificar = list(animal.personas)
    if not personas_a_notificar and hasattr(visita, 'veterinario') and visita.veterinario:
        personas_a_notificar.append(visita.veterinario)
    
    for persona in personas_a_notificar:
        tokens = _get_tokens_de_persona(persona.id_persona)
        if tokens:
            _enviar_push(
                tokens=tokens,
                title="Tratamiento actualizado",
                body=f'El tratamiento "{tratamiento.tipo}" de {animal.nombre} fue actualizado',
                data={
                    "id_tratamiento": tratamiento.id_tratamiento,
                    "id_visita": visita.id_visita,
                    "id_animal": animal.id_animal,
                    "tipo": "TRATAMIENTO_ACTUALIZADO"
                },
            )


def _notificar_tratamiento_agendado(tratamiento) -> None:
    visita = tratamiento.visita
    animal = visita.animal
    
    personas_a_notificar = list(animal.personas)
    if not personas_a_notificar and hasattr(visita, 'veterinario') and visita.veterinario:
        personas_a_notificar.append(visita.veterinario)
    
    for persona in personas_a_notificar:
        tokens = _get_tokens_de_persona(persona.id_persona)
        if tokens:
            mensaje = f'Se agendó el tratamiento "{tratamiento.tipo}" de {animal.nombre} en el calendario'
            if tratamiento.fecha_fin:
                mensaje += f" (finaliza {tratamiento.fecha_fin.strftime('%d/%m/%Y')})"
            _enviar_push(
                tokens=tokens,
                title="Tratamiento agendado",
                body=mensaje,
                data={
                    "id_tratamiento": tratamiento.id_tratamiento,
                    "id_visita": visita.id_visita,
                    "id_animal": animal.id_animal,
                    "tipo": "TRATAMIENTO_AGENDADO"
                },
            )


def notificar_tratamiento_por_vencer(tratamiento) -> None:
    try:
        visita = tratamiento.visita
        animal = visita.animal
        
        personas_a_notificar = list(animal.personas)
        if not personas_a_notificar and hasattr(visita, 'veterinario') and visita.veterinario:
            personas_a_notificar.append(visita.veterinario)
        
        for persona in personas_a_notificar:
            tokens = _get_tokens_de_persona(persona.id_persona)
            if tokens:
                _enviar_push(
                    tokens=tokens,
                    title="Tratamiento por vencer",
                    body=f'El tratamiento "{tratamiento.tipo}" de {animal.nombre} vence mañana. ¡No te olvides!',
                    data={
                        "id_tratamiento": tratamiento.id_tratamiento,
                        "id_visita": visita.id_visita,
                        "id_animal": animal.id_animal,
                        "tipo": "TRATAMIENTO_POR_VENCER"
                    },
                )
    except Exception as e:
        logger.error(f"[ERROR notificar_tratamiento_por_vencer] {e}")


# Job del scheduler — recordatorios de vencimiento para TRATAMIENTOS
def _job_recordatorios_tratamientos(app) -> None:
    with app.app_context():
        from app.models.tratamiento import Tratamiento

        tz = timezone(timedelta(hours=-3))
        ahora = datetime.now(tz).date()
        manana = ahora + timedelta(days=1)
        
        tratamientos = Tratamiento.query.filter(Tratamiento.fecha_fin == manana).all()

        for tratamiento in tratamientos:
            notificar_tratamiento_por_vencer(tratamiento)

        logger.info(f"[Scheduler] Tratamientos por vencer mañana: {len(tratamientos)}")


# Job del scheduler — recordatorios horarios
def _job_recordatorios_horarios(app) -> None:
    with app.app_context():
        from app.models.tarea import Tarea

        tz = timezone(timedelta(hours=-3))
        ahora = datetime.now(tz)
        en_una_hora = ahora + timedelta(hours=1)
        
        tareas = Tarea.query.filter(
            Tarea.fecha == en_una_hora.date(),
            Tarea.hora == en_una_hora.strftime("%H:%M"),
            Tarea.completada == False
        ).all()

        for tarea in tareas:
            for persona in tarea.personas:
                tokens = _get_tokens_de_persona(persona.id_persona)
                if tokens:
                    _enviar_push(
                        tokens=tokens,
                        title="Recordatorio de tarea",
                        body=f"La tarea '{tarea.nombre}' comienza en 1 hora. ¡No te olvides!",
                        data={"id_tarea": tarea.id_tarea, "tipo": "RECORDATORIO_HORARIO"}
                    )

# Job del scheduler — sincronización de estado "en tratamiento"
def _job_sincronizar_estados_tratamiento(app) -> None:
    with app.app_context():
        from app.services.tratamiento_service import TratamientoService

        try:
            print(f"[Scheduler] Ejecutando sincronización de estados...")
            TratamientoService.sincronizar_animales_en_tratamiento()
            print(f"[Scheduler] Sincronización completada.")
            logger.info("[Scheduler] Sincronización de estados 'en tratamiento' completada.")
        except Exception as e:
            print(f"[ERROR sincronizar_estados_tratamiento] {e}")
            logger.error(f"[ERROR sincronizar_estados_tratamiento] {e}")

def init_scheduler(app) -> None:
    if getattr(app, '_scheduler_initialized', False):
        return
    
    if _scheduler.running:
        _scheduler.remove_all_jobs()

    _scheduler.add_job(
        func=_job_recordatorios_vencimiento,
        args=[app],
        trigger="interval",
        hours=1,
        id="recordatorios_vencimiento",
        replace_existing=True,
        next_run_time=datetime.now(),
    )

    _scheduler.add_job(
        func=_job_recordatorios_tratamientos,
        args=[app],
        trigger="interval",
        hours=1,
        id="recordatorios_tratamientos",
        replace_existing=True,
        next_run_time=datetime.now(),
    )

    _scheduler.add_job(
        func=_job_recordatorios_horarios,
        args=[app],
        trigger="interval",
        hours=1,
        id="recordatorios_horarios",
        replace_existing=True,
        next_run_time=datetime.now(),
    )

    _scheduler.add_job(
        func=_job_sincronizar_estados_tratamiento,
        args=[app],
        trigger="cron",
        hour=0,
        minute=1,
        id="sincronizar_estados_tratamiento",
        replace_existing=True,
        next_run_time=datetime.now(),
    )

    if not _scheduler.running:
        _scheduler.start()
        logger.info("[Scheduler] Iniciado: recordatorios de vencimiento, tratamientos y horarios cada 1 hora.")
    
    app._scheduler_initialized = True


# Endpoints REST
@notificaciones_bp.route("/token", methods=["POST"])
@token_required
def guardar_token(decoded_token):
    data = request.get_json()
    token_valor = (data or {}).get("token", "").strip()

    if not token_valor or not token_valor.startswith("ExponentPushToken"):
        return jsonify({"error": "Token de Expo inválido"}), 400

    firebase_uid = decoded_token.get("uid")
    usuario = UsuarioService.get_usuario_by_firebase_uid(firebase_uid)

    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    existente = PushToken.query.filter_by(token=token_valor).first()

    if existente:
        existente.id_usuario = usuario.id_usuario
        existente.activo = True
        existente.updated_at = datetime.now(timezone.utc)
    else:
        db.session.add(PushToken(id_usuario=usuario.id_usuario, token=token_valor, activo=True))

    db.session.commit()
    return jsonify({"mensaje": "Token guardado"}), 200


@notificaciones_bp.route("/token", methods=["DELETE"])
@token_required
def eliminar_token(decoded_token):
    data = request.get_json()
    token_valor = ((data or {}).get("token", "").strip())

    if not token_valor:
        return jsonify({"error": "Token requerido"}), 400

    pt = PushToken.query.filter_by(token=token_valor).first()

    if pt:
        pt.activo = False
        pt.updated_at = datetime.now(timezone.utc)
        db.session.commit()

    return jsonify({"mensaje": "Token desactivado"}), 200


@notificaciones_bp.route("/test", methods=["POST"])
@token_required
def test_push(decoded_token):
    firebase_uid = decoded_token.get("uid")
    usuario = UsuarioService.get_usuario_by_firebase_uid(firebase_uid)

    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    tokens = [pt.token for pt in usuario.push_tokens if pt.activo]

    _enviar_push(
        tokens=tokens,
        title="🚀 Push de prueba",
        body="Si recibés esto, funciona todo"
    )

    return jsonify({"ok": True, "tokens": len(tokens)}), 200


@notificaciones_bp.route("/tratamiento-agendado/<int:tratamiento_id>", methods=["POST"])
@token_required
def notificar_tratamiento_agendado_endpoint(decoded_token, tratamiento_id):
    from app.models.tratamiento import Tratamiento
    
    tratamiento = Tratamiento.query.get(tratamiento_id)
    if not tratamiento:
        return jsonify({"error": "Tratamiento no encontrado"}), 404
    
    _notificar_tratamiento_agendado(tratamiento)
    
    return jsonify({
        "mensaje": "Notificación de agendado enviada",
        "tratamiento": tratamiento.tipo,
        "animal": tratamiento.visita.animal.nombre
    }), 200