# app/controllers/usuario_controller.py

from flask import request, jsonify
from app.services.usuario_service import UsuarioService


class UsuarioController:

    @staticmethod
    def get_all_usuarios():

        try:

            usuarios = UsuarioService.get_all_usuarios()

            return jsonify(usuarios), 200

        except Exception as e:

            return jsonify({
                "error": str(e)
            }), 500

    @staticmethod
    def create_usuario():

        data = request.get_json()

        if not data:

            return jsonify({
                "error": "Datos inválidos"
            }), 400

        email = data.get("email")
        firebase_uid = data.get("firebase_uid")
        tipo = data.get("tipo", "estandar")
        roles = data.get("roles", [])

        if not email or not firebase_uid:

            return jsonify({
                "error": "Faltan campos requeridos"
            }), 400

        try:

            usuario = UsuarioService.crear_usuario(
                email=email,
                firebase_uid=firebase_uid,
                tipo=tipo,
                roles=roles
            )

            return jsonify({
                "message": "Usuario creado correctamente",
                "id_usuario": usuario.id_usuario
            }), 201

        except Exception as e:

            return jsonify({
                "error": str(e)
            }), 400

    @staticmethod
    def delete_usuario(usuario_id):

        try:

            UsuarioService.eliminar_usuario(usuario_id)

            return jsonify({
                "message": "Usuario eliminado correctamente"
            }), 200

        except Exception as e:

            if "no encontrado" in str(e):

                return jsonify({
                    "error": str(e)
                }), 404

            return jsonify({
                "error": str(e)
            }), 500