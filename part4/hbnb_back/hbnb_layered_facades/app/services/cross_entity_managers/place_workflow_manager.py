from app.models.place_model import Place
from app.services.exception import (UserNotFound, InvalidPlaceData,
                                    OwnerNotFound, PlaceNotFound,
                                    AmenityNotFound, PlaceOwnerConsistency)

class PlaceWorkflowManager():
    def __init__(self, place_facade, user_facade, amenity_facade,
                 review_facade):
        self.place_facade = place_facade
        self.user_facade = user_facade
        self.amenity_facade = amenity_facade
        self.review_facade = review_facade

    def create_place(self, place_data):
        try:
            self.user_facade.get(place_data['owner_id'])
            # Instantiation has moved up to manager: so should data validation
            self.place_facade.is_valid(place_data)  # raising exceptions
            # Explicit parameters is safer and cleaner for SQLAlchemy
            place = Place(
                title=place_data['title'],
                description=place_data['description'],
                price=place_data['price'],
                latitude=place_data['latitude'],
                longitude=place_data['longitude'],
                owner_id=place_data['owner_id']
            )
            # Add amenities if provided
            if 'amenities' in place_data.keys():
                for amenity_id in place_data['amenities']:
                    amenity = self.amenity_facade.get(amenity_id)
                    if amenity:
                        # place.amenities is collection of obj tracked by SQLAl
                        place.amenities.append(amenity)
            # Commit from add method writes changes to places, place_amenity
            self.place_facade.gateway.add(place)
            return place
        except UserNotFound:
            raise OwnerNotFound
        except InvalidPlaceData:
            raise InvalidPlaceData
    
    def get_place_details(self, place_id):
        try:
            place = self.place_facade.get(place_id)
            owner = self.user_facade.get(place.owner_id)
            amenity_list = []
            for id in place.amenities:
                obj = self.amenity_facade.get(id)
                amenity_list.append({
                    'id': obj.id,
                    'name': obj.name
                })
            reviews_list = []
            for id in place.reviews:
                obj = self.review_facade.get(id)
                reviews_list.append(obj)
            # Alternative
            # amenity_list = [{'id': obj.id, 'name': obj.name} 
                # for id in place.amenities
                # if (obj := self.amenity_facade.get(id))] (walrus operator)
            return {
                'id': place.id,
                'title': place.title,
                'description': place.description,
                'price': place.price,
                'latitude': place.latitude,
                'longitude': place.longitude,
                'owner_id': place.owner_id,
                'owner': {
                    'id': owner.id,
                    'first_name': owner.first_name,
                    'last_name': owner.last_name,
                    'email': owner.email
                },
                'amenities': amenity_list,
                'reviews': reviews_list
            }
        except PlaceNotFound:
            raise PlaceNotFound
        except UserNotFound:
            raise OwnerNotFound
        except AmenityNotFound:
            raise AmenityNotFound
        
    def update_place(self, place_id, place_data):
        try:
            # Get the place
            place = self.place_facade.get(place_id)
            initial_owner = place.owner_id
            # Check for owner consistency
            if initial_owner != place_data['owner_id']:
                raise PlaceOwnerConsistency

            # Handle amenities
            if 'amenities' in place_data and place_data['amenities']:
                amenities = []
                for amenity_id in place_data['amenities']:
                    # Get amenity objects
                    try:
                        amenity = self.amenity_facade.get(amenity_id)
                        amenities.append(amenity)
                    except AmenityNotFound:
                        raise InvalidPlaceData
                        
                # Replace existing amenities
                place.amenities = amenities  # This replaces the entire collection
            return self.place_facade.update_place(place_id, place_data)
        except PlaceNotFound:
            raise PlaceNotFound
        except InvalidPlaceData:
            raise InvalidPlaceData
    
    # A revoir lors de l'implémentation DB
    def delete_place(self, place_id):
        try:
            place = self.place_facade.get(place_id)  # get place obj
            owner_id = place.owner_id  # get id str from obj
            # send deletion request to user_facade
            self.user_facade.delete_place(place_id, owner_id)
            # send deletion request to place_facade
            self.place_facade.delete_place(place_id)  # delete place
            return {"message": "Place deleted successfully"}, 200
        except PlaceNotFound:
            raise PlaceNotFound
