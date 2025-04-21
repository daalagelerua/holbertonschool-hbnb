from app.persistence.gateways.repository import SQLAlchemyRepository

class PlaceGateway(SQLAlchemyRepository):
    def __init__(self):
        from app.models.place_model import Place
        super().__init__(Place)