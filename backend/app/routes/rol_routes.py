from flask import Blueprint
from app.controllers.rol_controller import RolController
from app.utils.decorators import token_required

rol_bp = Blueprint('roles', __name__)

@rol_bp.route('', methods=['GET'])
@token_required
def get_roles(decoded_token):
    return RolController.get_all_roles()