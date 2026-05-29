from flask import jsonify
from app.services.rol_service import RolService

class RolController:
    
    @staticmethod
    def get_all_roles():
        try:
            roles = RolService.get_all_roles()
            return jsonify(roles), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500