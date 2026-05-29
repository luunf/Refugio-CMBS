from flask import request, jsonify
from app.services.usuario_service import UsuarioService


class UsuarioController:

    @staticmethod
    def create_usuario():

        data = request.get_json()

        if not data:

            return jsonify({
                "error": "Datos inválidos"
            }), 400

        try:

            usuario = UsuarioService.crear_usuario(data)

            return jsonify({
                "message": "Usuario creado correctamente",
                "id_usuario": usuario.id_usuario
            }), 201

        except Exception as e:

            return jsonify({
                "error": str(e)
            }), 400

    @staticmethod
    def get_all_usuarios():

        usuarios = UsuarioService.get_all_usuarios()

        return jsonify(usuarios), 200

    @staticmethod
    def delete_usuario(usuario_id):

        try:

            UsuarioService.eliminar_usuario(usuario_id)

            return jsonify({
                "message": "Usuario eliminado correctamente"
            }), 200

        except Exception as e:

            return jsonify({
                "error": str(e)
            }), 400