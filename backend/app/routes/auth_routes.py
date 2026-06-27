from flask import Blueprint
from app.controllers.auth_controller import AuthController
from app.utils.decorators import token_required

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/me', methods=['GET'])
@token_required
def get_current_user(decoded_token):
    return AuthController.get_current_user(decoded_token)

@auth_bp.route('/check-email', methods=['POST'])
def check_email():
    return AuthController.check_email()