from flask import request, jsonify, current_app
from app.services.firebase_service import FirebaseService
from app.services.usuario_service import UsuarioService

class AuthController:
    
    @staticmethod
    def get_current_user(decoded_token):

        firebase_uid = decoded_token.get('uid')

        usuario = UsuarioService.get_usuario_by_firebase_uid(firebase_uid)

        if not usuario:
            return jsonify({"error": "Usuario no encontrado"}), 404
        
        persona = usuario.persona

        roles = [rol.nombre for rol in persona.roles]
        
        perfil_completo = bool(
            persona.nombre and
            persona.apellido
        ) 

        return jsonify({
            "id_usuario": usuario.id_usuario,
            "email": usuario.email,
            "nombre": persona.nombre,
            "apellido": persona.apellido,
            "tipo": usuario.tipo,
            "roles": roles,
            "persona_id": persona.id_persona,
            "perfil_completo": perfil_completo
        }), 200
    
    