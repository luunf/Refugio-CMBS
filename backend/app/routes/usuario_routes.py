from flask import Blueprint
from app.controllers.usuario_controller import UsuarioController
from app.utils.decorators import token_required

usuario_bp = Blueprint('usuarios', __name__)

@usuario_bp.route('', methods=['GET'])
@token_required
def get_usuarios(decoded_token):
    return UsuarioController.get_all_usuarios()

@usuario_bp.route('', methods=['POST']) #para pruebas saque el token_required, despues lo vuelvo a poner
#@token_required
#def create_usuario(decoded_token):
def create_usuario():
    return UsuarioController.create_usuario()

@usuario_bp.route('/<int:usuario_id>', methods=['DELETE'])
@token_required
def delete_usuario(decoded_token, usuario_id):
    return UsuarioController.delete_usuario(usuario_id)