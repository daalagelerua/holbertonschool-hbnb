from app.persistence.gateways.repository import SQLAlchemyRepository


class AmenityGateway(SQLAlchemyRepository):
    def __init__(self):
        from app.models.amenity_model import Amenity
        super().__init__(Amenity)
