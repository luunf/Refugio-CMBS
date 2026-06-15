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

    @staticmethod
    def get_usuario(usuario_id):

        usuario = UsuarioService.get_usuario(usuario_id)

        if not usuario:
            return jsonify({
                "error": "Usuario no encontrado"
            }), 404

        return jsonify(usuario), 200
    
    @staticmethod
    def update_usuario(usuario_id):

        data = request.get_json()

        try:

            usuario = UsuarioService.update_usuario(
                usuario_id,
                data
            )

            return jsonify({
                "message": "Usuario actualizado correctamente",
                "id_usuario": usuario.id_usuario
            }), 200

        except Exception as e:

            return jsonify({
                "error": str(e)
            }), 400