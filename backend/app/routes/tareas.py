from flask import Blueprint, request, jsonify
from app.extensions import db
from app.models.tarea import Tarea
from app.models.persona import Persona
from app.utils.email import enviar_email_asignacion, enviar_email_modificacion

tareas_bp = Blueprint("tareas", __name__)


# GET /tareas  (con filtro opcional ?mes=4&year=2026)
@tareas_bp.route("/tareas", methods=["GET"])
def get_tareas():
    mes = request.args.get("mes")
    year = request.args.get("year")

    query = Tarea.query
    if mes and year:
        query = query.filter(
            db.extract("month", Tarea.fecha) == int(mes),
            db.extract("year", Tarea.fecha) == int(year)
        )

    tareas = query.all()
    return jsonify([t.to_dict() for t in tareas]), 200


# GET /tareas/<id>
@tareas_bp.route("/tareas/<int:id>", methods=["GET"])
def get_tarea(id):
    tarea = Tarea.query.get_or_404(id)
    return jsonify(tarea.to_dict()), 200


# POST /tareas
@tareas_bp.route("/tareas", methods=["POST"])
def create_tarea():
    data = request.json
    personas_ids = data.pop("personas_ids", [])

    tarea = Tarea(
        nombre=data["nombre"],
        fecha=data["fecha"],
        hora=data.get("hora"),
        es_todo_el_dia=data.get("es_todo_el_dia", False),
        completada=data.get("completada", False)
    )

    db.session.add(tarea)
    db.session.flush()

    if personas_ids:
        personas = Persona.query.filter(Persona.id_persona.in_(personas_ids)).all()
        tarea.personas = personas

    db.session.commit()

    for persona in tarea.personas:           # ← con minúscula, sobre la instancia
        enviar_email_asignacion(persona, tarea)

    return jsonify(tarea.to_dict()), 201


# PATCH /tareas/<id>
@tareas_bp.route("/tareas/<int:id>", methods=["PATCH"])
def update_tarea(id):
    tarea = Tarea.query.get_or_404(id)
    data = request.json
    personas_ids = data.pop("personas_ids", None)

    for key, value in data.items():
        if hasattr(tarea, key):
            setattr(tarea, key, value)

    if personas_ids is not None:
        personas = Persona.query.filter(Persona.id_persona.in_(personas_ids)).all()
        tarea.personas = personas

    db.session.commit()

    for persona in tarea.personas:           # ← con minúscula, sobre la instancia
        enviar_email_modificacion(persona, tarea)

    return jsonify(tarea.to_dict()), 200

# DELETE /tareas/<id>
@tareas_bp.route("/tareas/<int:id>", methods=["DELETE"])
def delete_tarea(id):
    tarea = Tarea.query.get_or_404(id)
    db.session.delete(tarea)
    db.session.commit()
    return jsonify({"message": "Tarea eliminada correctamente"}), 200


# GET /personas/<id>/tareas
@tareas_bp.route("/personas/<int:id>/tareas", methods=["GET"])
def get_tareas_de_persona(id):
    persona = Persona.query.get_or_404(id)
    return jsonify([t.to_dict() for t in persona.tareas]), 200


# GET /tareas/<id>/personas
@tareas_bp.route("/tareas/<int:id>/personas", methods=["GET"])
def get_personas_de_tarea(id):
    tarea = Tarea.query.get_or_404(id)
    return jsonify([p.to_dict() for p in tarea.personas]), 200