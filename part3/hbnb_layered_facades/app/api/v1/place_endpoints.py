from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import jwt_required
from app.services import facade
from flask_cors import cross_origin
from app.api.v1.authentication_utils import (owner_matches_or_admin,
                                             place_owner_matches_user,
                                             admin_required)
from app.services.exception import (InvalidPlaceData, OwnerNotFound,
                                    PlaceNotFound, AmenityNotFound,
                                    PlaceOwnerConsistency)

api = Namespace('places', description='Place operations')

place_input_model = api.model('PlaceInput', {
    'title': fields.String(
        required=True, description='Title of the place'),
    'description': fields.String(
        description='Description of the place'),
    'price': fields.Float(
        required=True, description='Price per night'),
    'latitude': fields.Float(
        required=True, description='Latitude of the place'),
    'longitude': fields.Float(
        required=True, description='Longitude of the place'),
    'owner_id': fields.String(
        required=True, description='ID of the owner'),
})

review_output_model = api.model('PlaceReviewOutput', {
    'id': fields.String(description='Review ID'),
    'text': fields.String(description='Text of the review'),
    'rating': fields.Integer(description='Rating of the place (1-5)'),
    'user_id': fields.String(description='ID of the user')
})

amenity_output_model = api.model('AmenityOutput', {
    'id': fields.String(description='Amenity ID'),
    'name': fields.String(required=True, description='Name of the amenity')
})

user_output_model = api.model('UserOutput', {
    'id': fields.String(description='User ID'),
    'first_name': fields.String(
        required=True, description='First name of the user'),
    'last_name': fields.String(
        required=True, description='Last name of the user'),
    'email': fields.String(
        required=True, description='Email of the user')
})

place_detailed_output_model = api.model('PlaceDetailsOutput', {
    'id': fields.String(description='Place ID'),
    'title': fields.String(
        required=True, description='Title of the place'),
    'description': fields.String(
        description='Description of the place'),
    'price': fields.Float(
        required=True, description='Price per night'),
    'latitude': fields.Float(
        required=True, description='Latitude of the place'),
    'longitude': fields.Float(
        required=True, description='Longitude of the place'),
    'owner_id': fields.String(
        required=True, description='ID of the owner'),
    'owner': fields.Nested(
        user_output_model,
        description='Owner of the place'
    ),
    'amenities': fields.List(
        fields.Nested(amenity_output_model),
        description='List of amenities'
    ),
    'reviews': fields.List(
        fields.Nested(review_output_model),
        description='List of reviews'
    )
})

place_light_output_model = api.model('PlaceDetailsOutput', {
    'id': fields.String(description='Place ID'),
    'title': fields.String(
        required=True, description='Title of the place'),
    'description': fields.String(
        description='Description of the place'),
    'price': fields.Float(
        required=True, description='Price per night'),
    'latitude': fields.Float(
        required=True, description='Latitude of the place'),
    'longitude': fields.Float(
        required=True, description='Longitude of the place'),
    'owner_id': fields.String(
        required=True, description='ID of the owner'),
})

@api.route('/')
@cross_origin(origins="http://localhost:5500", methods=["GET", "POST", "OPTIONS"])
class PlaceList(Resource):
    @place_owner_matches_user
    @api.expect(place_input_model, validate=True)
    @api.response(201, 'Place successfully created')
    @api.response(400, 'Invalid input data')
    def post(self):
        """Create a new place"""
        place_data = api.payload

        try:
            place = facade.place_manager.create_place(place_data)
            return api.marshal(place, place_light_output_model), 201
        except InvalidPlaceData:
            return {'error': 'Invalid input data'}, 400
        except OwnerNotFound:
            return {'error': 'Owner not found'}, 404

    @api.response(200, 'List of places retrieved successfully')
    def get(self):
        """Retrieve a list of all places"""
        return facade.place_facade.get_all_places(), 200

@api.route('/<place_id>')
@api.doc(params={'place_id': 'The place ID'})
class PlaceResource(Resource):
    @owner_matches_or_admin
    @api.response(200, 'Place details retrieved successfully')
    @api.response(404, 'Place not found')
    def get(self, place_id):
        """Get place details by ID"""
        try:
            place = facade.place_facade.get(place_id)
            return api.marshal(place, place_detailed_output_model), 200
        except PlaceNotFound:
            return {'error': 'Place not found'}, 404
        except OwnerNotFound:
            return {'error': 'Owner not found'}, 404
        except AmenityNotFound:
            return {'error': 'Amenity not found'}, 404

    @owner_matches_or_admin
    @api.expect(place_input_model)
    @api.response(200, 'Place updated successfully')
    @api.response(404, 'Place not found')
    @api.response(400, 'Invalid input data')
    def put(self, place_id):
        try:
            facade.place_manager.update_place(place_id, api.payload)
            return {'message': 'Place updated successfully'}, 200
        except PlaceNotFound:
            return {'error': 'Place not found'}, 404
        except InvalidPlaceData:
            return {'error': 'Invalid input data'}, 400
        except PlaceOwnerConsistency:
            return {"error": "Can't change place owner"}, 400

    # A revoir
    @admin_required
    @api.response(200, 'Place deleted successfully')
    @api.response(404, 'Place not found')
    def delete(self, place_id):
        """Delete a place"""
        try:
            # Retrieve place
            place = facade.place_manager.place_facade.get(place_id)
            # Iterate reviews
            for review in place.reviews:
                # delete review (clean up)
                facade.review_facade.delete_review(review.id)
            # delete place
            facade.place_facade.delete_place(place_id)
            return {"message": "Place deleted successfully"}, 200
        except PlaceNotFound:
            api.abort(404, error='Place not found')