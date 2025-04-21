from app.persistence.gateways.amenity_gateway import AmenityGateway
from app.models.amenity_model import Amenity
from app.services.exception import InvalidAmenityData, AmenityAlreadyExists, AmenityNotFound

class AmenityFacade:
    def __init__(self):
        self.gateway = AmenityGateway()

    def create_amenity(self, amenity_data):
        amenity = Amenity(**amenity_data)
        if self.is_valid(amenity_data) == False:
            raise InvalidAmenityData('Invalid input data')
        self.gateway.add(amenity)
        return amenity
    
    def get_all_amenities(self):
        amenities = self.gateway.get_all()
        return [
        {
            'id': amenity.id,
            'name': amenity.name
        }
        for amenity in amenities
    ]

    def get(self, amenity_id):
        amenity = self.gateway.get(amenity_id)
        if amenity is None:
            raise AmenityNotFound
        return amenity

    def update_amenity(self, amenity, amenity_data):
        updating_amenity = self.gateway.get_by_attribute('id', amenity.id)
        if not updating_amenity:
            raise AmenityNotFound

        if self.is_valid(amenity_data) == False:
            raise InvalidAmenityData('Invalid input data')

        updating_amenity.update(amenity_data)
        return updating_amenity
    
    def is_valid(self, data):
        if not data or 'name' not in data.keys():
            raise InvalidAmenityData
        if type(data['name']) is not str:
            raise InvalidAmenityData
        if len(data['name']) > 50 or len(data['name']) < 3:
            raise InvalidAmenityData
        return True
