from app.models import Rol

class RolService:
    @staticmethod
    def get_all_roles():
        roles = Rol.query.all()
        return [{"id_rol": r.id_rol, "nombre": r.nombre} for r in roles]