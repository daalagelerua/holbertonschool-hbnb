from app.persistence.gateways.place_gateway import PlaceGateway
from app.services.exception import (InvalidPlaceData, PlaceNotFound,
                                    ReviewNotFound)

class PlaceFacade:
    def __init__(self):
        self.gateway = PlaceGateway()

    def get_all_places(self):
        places = self.gateway.get_all()
        return [
            {
                'id': place.id,
                'title': place.title,
                'latitude': place.latitude,
                'longitude': place.longitude
            }
            for place in places
        ]
    
    def get(self, place_id):
        place = self.gateway.get(place_id)
        if place is None:
            raise PlaceNotFound
        return place
    
    def update_place(self, place_id, place_data):
        # retreive place updating his profile
        updating_place = self.get(place_id)
        # checking data before writing into storage
        if self.is_valid(place_data) is not True:
            raise InvalidPlaceData
        self.gateway.update(place_id, place_data)
        return updating_place

    # A revoir
    def delete_review(self, review_id, place_id):
        place = self.get(place_id)
        self.gateway.delete_review(place, review_id)
        if review_id in place.reviews:
            raise ReviewNotFound
        return place
    
    def is_valid(self, place_data):
        if 'price' in place_data.keys() and\
            (type(place_data['price']) is not float or
            place_data['price'] < 0.0):
            raise InvalidPlaceData

        if 'latitude' in place_data.keys() and\
            (type(place_data['latitude']) is not float or
            place_data['latitude'] < -90.0 or
            place_data['latitude'] > 90.0):
            raise InvalidPlaceData
        
        if 'longitude' in place_data.keys() and\
            (type(place_data['longitude']) is not float or
            place_data['longitude'] < -180.0 or
            place_data['longitude'] > 180.0):
            raise InvalidPlaceData

        return True

    def delete_place(self, place_id):
        self.gateway.delete(place_id)
        return True
