from flask import Blueprint
from app.controllers.auth_controller import AuthController
from app.utils.decorators import token_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(decoded_token):
    return AuthController.get_current_user(decoded_token)

#desarrollo: endpoint para loguearse sin firebase, solo con el id del usuario ()
@auth_bp.route('/dev-login/<int:usuario_id>', methods=['GET'])
def dev_login(usuario_id):
    return AuthController.dev_login(usuario_id)