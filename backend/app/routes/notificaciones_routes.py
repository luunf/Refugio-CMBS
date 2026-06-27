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

        print(
            f"Usuario {u.id_usuario} tiene {len(u.push_tokens)} tokens"
        )

        for pt in u.push_tokens:

            print(
                f"Token: {pt.token} - activo={pt.activo}"
            )

            if pt.activo:
                tokens.append(pt.token)

    return tokens


def _enviar_push(tokens: list[str], title: str, body: str, data: dict = None) -> None:
    """
    Envía notificaciones push a través de la Expo Push API.
    Acepta hasta 100 tokens por llamada (límite de Expo).
    Falla silenciosamente con log de error para no romper el flujo principal.
    """
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

        print("STATUS:", resp.status_code)
        print("RESPUESTA:", resp.text)

        resp.raise_for_status()

        logger.info(
            f"[Push] {len(mensajes)} notificaciones enviadas OK"
        )

    except requests.RequestException as e:
        print("ERROR:", e)

        logger.error(
            f"[Push] Error al enviar notificaciones: {e}"
        )


# ─────────────────────────────────────────────────────────────────────────────
# Funciones públicas — llamalas desde tus otras rutas
# ─────────────────────────────────────────────────────────────────────────────

def notificar_tarea_asignada(
    tarea,
    personas_ids: list[int],
    asignado_por: str
) -> None:

    for id_persona in personas_ids:

        tokens = _get_tokens_de_persona(
            id_persona
        )

        print(
            f"[DEBUG] Persona {id_persona} -> tokens: {tokens}"
        )

        _enviar_push(
            tokens=tokens,
            title="📋 Nueva tarea asignada",
            body=f'{asignado_por} te asignó: "{tarea.nombre}"',
            data={
                "id_tarea": tarea.id_tarea,
                "tipo": "TAREA_ASIGNADA"
            },
        )


def notificar_tarea_completada(tarea, completada_por: str) -> None:
    """
    Notifica a todas las personas de la tarea cuando se marca como completada.

    Llamada desde: app/routes/tareas.py → PATCH /tareas/<id>/completar

    Ejemplo:
        from app.routes.notificaciones_routes import notificar_tarea_completada
        notificar_tarea_completada(tarea, nombre_usuario_actual)
    """
    for persona in tarea.personas:
        tokens = _get_tokens_de_persona(persona.id_persona)
        _enviar_push(
            tokens=tokens,
            title="✅ Tarea completada",
            body=f'"{tarea.nombre}" fue marcada como completada por {completada_por}',
            data={"id_tarea": tarea.id_tarea, "tipo": "TAREA_COMPLETADA"},
        )


def notificar_tarea_cancelada(tarea, cancelada_por: str) -> None:
    """
    Notifica a todas las personas de la tarea cuando se elimina/cancela.

    Llamada desde: app/routes/tareas.py → DELETE /tareas/<id>

    Ejemplo:
        from app.routes.notificaciones_routes import notificar_tarea_cancelada
        notificar_tarea_cancelada(tarea, nombre_usuario_actual)
    """
    for persona in tarea.personas:
        tokens = _get_tokens_de_persona(persona.id_persona)
        _enviar_push(
            tokens=tokens,
            title="❌ Tarea cancelada",
            body=f'"{tarea.nombre}" fue cancelada por {cancelada_por}',
            data={"id_tarea": tarea.id_tarea, "tipo": "TAREA_CANCELADA"},
        )


# ─────────────────────────────────────────────────────────────────────────────
# Job del scheduler — recordatorios de vencimiento
# ─────────────────────────────────────────────────────────────────────────────

def _job_recordatorios_vencimiento(app) -> None:
    """
    Corre cada hora. Busca tareas no completadas que vencen en las
    próximas 24 horas y envía recordatorios a sus personas asignadas.
    """
    with app.app_context():
        from app.models.tarea import Tarea  # import local

        ahora = datetime.now(timezone.utc).date()
        manana = ahora + timedelta(days=1)
        #manana = ahora
        tareas = (
            Tarea.query
            .filter(
                Tarea.fecha == manana,
                Tarea.completada == False,  # noqa: E712
            )
            .all()
        )

        logger.info(f"[Scheduler] Tareas por vencer mañana: {len(tareas)}")

        for tarea in tareas:
            for persona in tarea.personas:
                tokens = _get_tokens_de_persona(persona.id_persona)
                _enviar_push(
                    tokens=tokens,
                    title="⏰ Tarea por vencer",
                    body=f'"{tarea.nombre}" vence mañana. ¡No te olvides!',
                    data={"id_tarea": tarea.id_tarea, "tipo": "TAREA_POR_VENCER"},
                )


# ─────────────────────────────────────────────────────────────────────────────
# NUEVO: Notificaciones para TRATAMIENTOS
# ─────────────────────────────────────────────────────────────────────────────

def notificar_tratamiento_actualizado(tratamiento) -> None:
    """Notifica a las personas asociadas al animal cuando se actualiza un tratamiento."""
    visita = tratamiento.visita
    animal = visita.animal
    
    print(f"=== [ACTUALIZADO] Tratamiento: {tratamiento.tipo} (ID: {tratamiento.id_tratamiento}) ===")
    print(f"[ACTUALIZADO] Animal: {animal.nombre} (ID: {animal.id_animal})")
    print(f"[ACTUALIZADO] Personas asociadas: {len(animal.personas)}")
    
    personas_a_notificar = list(animal.personas)
    
    if not personas_a_notificar and hasattr(visita, 'veterinario') and visita.veterinario:
        personas_a_notificar.append(visita.veterinario)
        print(f"[ACTUALIZADO] Usando fallback: veterinario de la visita: {visita.veterinario.nombre}")
    
    for persona in personas_a_notificar:
        tokens = _get_tokens_de_persona(persona.id_persona)
        if tokens:
            _enviar_push(
                tokens=tokens,
                title="🔄 Tratamiento actualizado",
                body=f'El tratamiento "{tratamiento.tipo}" de {animal.nombre} fue actualizado',
                data={
                    "id_tratamiento": tratamiento.id_tratamiento,
                    "id_visita": visita.id_visita,
                    "id_animal": animal.id_animal,
                    "tipo": "TRATAMIENTO_ACTUALIZADO"
                },
            )


def _notificar_tratamiento_agendado(tratamiento) -> None:
    """Notifica a las personas asociadas al animal cuando se agenda un tratamiento."""
    visita = tratamiento.visita
    animal = visita.animal
    
    print(f"=== [AGENDADO] Tratamiento: {tratamiento.tipo} (ID: {tratamiento.id_tratamiento}) ===")
    print(f"[AGENDADO] Animal: {animal.nombre} (ID: {animal.id_animal})")
    print(f"[AGENDADO] Personas asociadas: {len(animal.personas)}")
    
    personas_a_notificar = list(animal.personas)
    
    if not personas_a_notificar and hasattr(visita, 'veterinario') and visita.veterinario:
        personas_a_notificar.append(visita.veterinario)
        print(f"[AGENDADO] Usando fallback: veterinario de la visita: {visita.veterinario.nombre}")
    
    print(f"[AGENDADO] Total a notificar: {len(personas_a_notificar)}")
    
    for persona in personas_a_notificar:
        tokens = _get_tokens_de_persona(persona.id_persona)
        print(f"[AGENDADO] {persona.nombre} {persona.apellido}: {len(tokens)} tokens")
        if tokens:
            mensaje = f'Se agendó el tratamiento "{tratamiento.tipo}" de {animal.nombre} en el calendario'
            if tratamiento.fecha_fin:
                mensaje += f" (finaliza {tratamiento.fecha_fin.strftime('%d/%m/%Y')})"
            _enviar_push(
                tokens=tokens,
                title="📅 Tratamiento agendado",
                body=mensaje,
                data={
                    "id_tratamiento": tratamiento.id_tratamiento,
                    "id_visita": visita.id_visita,
                    "id_animal": animal.id_animal,
                    "tipo": "TRATAMIENTO_AGENDADO"
                },
            )


def notificar_tratamiento_por_vencer(tratamiento) -> None:
    """Notifica a las personas asociadas al animal cuando un tratamiento está por vencer."""
    try:
        visita = tratamiento.visita
        animal = visita.animal
        
        print(f"=== [POR VENCER] Tratamiento: {tratamiento.tipo} (ID: {tratamiento.id_tratamiento}) ===")
        print(f"[POR VENCER] Animal: {animal.nombre} (ID: {animal.id_animal})")
        print(f"[POR VENCER] Personas asociadas: {len(animal.personas)}")
        
        personas_a_notificar = list(animal.personas)
        
        if not personas_a_notificar and hasattr(visita, 'veterinario') and visita.veterinario:
            personas_a_notificar.append(visita.veterinario)
            print(f"[POR VENCER] Usando fallback: veterinario de la visita: {visita.veterinario.nombre} {visita.veterinario.apellido}")
        
        print(f"[POR VENCER] Total a notificar: {len(personas_a_notificar)}")
        
        for persona in personas_a_notificar:
            print(f"[POR VENCER] Evaluando: {persona.nombre} {persona.apellido} (ID: {persona.id_persona})")
            tokens = _get_tokens_de_persona(persona.id_persona)
            print(f"[POR VENCER] Tokens encontrados: {len(tokens)}")
            if tokens:
                _enviar_push(
                    tokens=tokens,
                    title="⏰ Tratamiento por vencer",
                    body=f'El tratamiento "{tratamiento.tipo}" de {animal.nombre} vence mañana',
                    data={
                        "id_tratamiento": tratamiento.id_tratamiento,
                        "id_visita": visita.id_visita,
                        "id_animal": animal.id_animal,
                        "tipo": "TRATAMIENTO_POR_VENCER"
                    },
                )
            else:
                print(f"[POR VENCER] ⚠️ No hay tokens para {persona.nombre} {persona.apellido}")
                
    except Exception as e:
        print(f"[ERROR notificar_tratamiento_por_vencer] {e}")
        import traceback
        traceback.print_exc()


# ─────────────────────────────────────────────────────────────────────────────
# NUEVO: Job del scheduler — recordatorios de vencimiento para TRATAMIENTOS
# ─────────────────────────────────────────────────────────────────────────────

def _job_recordatorios_tratamientos(app) -> None:
    """Corre cada hora. Busca tratamientos que vencen mañana y envía recordatorios."""
    with app.app_context():
        from app.models.tratamiento import Tratamiento

        tz = timezone(timedelta(hours=-3))
        ahora = datetime.now(tz).date()
        manana = ahora + timedelta(days=1)
        
        print(f"=== [SCHEDULER TRATAMIENTOS] Ejecutando ===")
        print(f"[SCHEDULER TRATAMIENTOS] Hoy (Argentina): {ahora}")
        print(f"[SCHEDULER TRATAMIENTOS] Mañana (Argentina): {manana}")
        
        tratamientos = (
            Tratamiento.query
            .filter(Tratamiento.fecha_fin == manana)
            .all()
        )

        print(f"[SCHEDULER TRATAMIENTOS] Tratamientos que vencen mañana: {len(tratamientos)}")

        for tratamiento in tratamientos:
            print(f"[SCHEDULER TRATAMIENTOS] Enviando notificación para: {tratamiento.tipo} (ID: {tratamiento.id_tratamiento})")
            notificar_tratamiento_por_vencer(tratamiento)

        logger.info(f"[Scheduler] Tratamientos por vencer mañana: {len(tratamientos)}")


def init_scheduler(app) -> None:
    """
    Inicializa el scheduler de recordatorios.
    Llamalo en create_app() después de registrar los blueprints.

    En app/__init__.py:
        from app.routes.notificaciones_routes import notificaciones_bp, init_scheduler
        app.register_blueprint(notificaciones_bp, url_prefix="/notificaciones")
        init_scheduler(app)
    """
    if _scheduler.running:
        return

    _scheduler.add_job(
        func=_job_recordatorios_vencimiento,
        args=[app],
        trigger="interval",
        hours=1,
        id="recordatorios_vencimiento",
        replace_existing=True,
        next_run_time=datetime.now(),  # ejecutar al iniciar también
    )

    # ─── NUEVO: Job para tratamientos ───
    _scheduler.add_job(
        func=_job_recordatorios_tratamientos,
        args=[app],
        trigger="interval",
        hours=1,
        id="recordatorios_tratamientos",
        replace_existing=True,
        next_run_time=datetime.now(),
    )

    _scheduler.start()
    logger.info("[Scheduler] Iniciado: recordatorios de vencimiento y tratamientos cada 1 hora.")


# ─────────────────────────────────────────────────────────────────────────────
# Endpoints REST
# ─────────────────────────────────────────────────────────────────────────────

@notificaciones_bp.route("/token", methods=["POST"])
@token_required
def guardar_token(decoded_token):

    data = request.get_json()
    token_valor = (data or {}).get("token", "").strip()

    if not token_valor or not token_valor.startswith("ExponentPushToken"):
        return jsonify({
            "error": "Token de Expo inválido"
        }), 400

    firebase_uid = decoded_token.get("uid")

    usuario = UsuarioService.get_usuario_by_firebase_uid(
        firebase_uid
    )

    if not usuario:
        return jsonify({
            "error": "Usuario no encontrado"
        }), 404

    existente = PushToken.query.filter_by(
        token=token_valor
    ).first()

    if existente:
        existente.id_usuario = usuario.id_usuario
        existente.activo = True
        existente.updated_at = datetime.now(
            timezone.utc
        )

    else:
        db.session.add(
            PushToken(
                id_usuario=usuario.id_usuario,
                token=token_valor,
                activo=True,
            )
        )

    db.session.commit()

    return jsonify({
        "mensaje": "Token guardado"
    }), 200


@notificaciones_bp.route("/token", methods=["DELETE"])
@token_required
def eliminar_token(decoded_token):

    data = request.get_json()

    token_valor = (
        (data or {})
        .get("token", "")
        .strip()
    )

    if not token_valor:
        return jsonify({
            "error": "Token requerido"
        }), 400

    pt = PushToken.query.filter_by(
        token=token_valor
    ).first()

    if pt:
        pt.activo = False
        pt.updated_at = datetime.now(
            timezone.utc
        )
        db.session.commit()

    return jsonify({
        "mensaje": "Token desactivado"
    }), 200


@notificaciones_bp.route("/test", methods=["POST"])
@token_required
def test_push(decoded_token):

    firebase_uid = decoded_token.get("uid")

    usuario = UsuarioService.get_usuario_by_firebase_uid(
        firebase_uid
    )

    if not usuario:
        return jsonify({
            "error": "Usuario no encontrado"
        }), 404

    tokens = [
        pt.token
        for pt in usuario.push_tokens
        if pt.activo
    ]

    _enviar_push(
        tokens=tokens,
        title="🚀 Push de prueba",
        body="Si recibés esto, funciona todo"
    )

    return jsonify({
        "ok": True,
        "tokens": len(tokens)
    }), 200


# ─────────────────────────────────────────────────────────────────────────────
# NUEVO: Endpoint para notificar agendado de tratamiento
# ─────────────────────────────────────────────────────────────────────────────

@notificaciones_bp.route("/tratamiento-agendado/<int:tratamiento_id>", methods=["POST"])
@token_required
def notificar_tratamiento_agendado_endpoint(decoded_token, tratamiento_id):
    """
    Endpoint para notificar que un tratamiento fue agendado en el calendario.
    """
    from app.models.tratamiento import Tratamiento
    
    tratamiento = Tratamiento.query.get(tratamiento_id)
    if not tratamiento:
        return jsonify({"error": "Tratamiento no encontrado"}), 404
    
    print(f"=== Notificando agendado de tratamiento {tratamiento_id} ===")
    _notificar_tratamiento_agendado(tratamiento)
    
    return jsonify({
        "mensaje": "Notificación de agendado enviada",
        "tratamiento": tratamiento.tipo,
        "animal": tratamiento.visita.animal.nombre
    }), 200