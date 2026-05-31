from app.models import Estado


class EstadoService:

    @staticmethod
    def get_all_estados():
        estados = Estado.query.all()
        return [{"id_estado": e.id_estado, "nombre": e.nombre} for e in estados]