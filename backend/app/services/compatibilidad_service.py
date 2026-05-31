from app.models import Compatibilidad


class CompatibilidadService:

    @staticmethod
    def get_all_compatibilidades():
        compatibilidades = Compatibilidad.query.all()
        return [{"id_compatibilidad": c.id_compatibilidad, "nombre": c.nombre} for c in compatibilidades]