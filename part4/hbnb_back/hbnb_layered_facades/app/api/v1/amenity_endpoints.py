from flask_restx import Namespace, Resource, fields
from app.services import facade
from app.api.v1.authentication_utils import admin_required
from app.services.exception import (InvalidAmenityData, AmenityAlreadyExists,
                                    AmenityNotFound)


api = Namespace('amenities', description='Amenity operations')

# Define the amenity model for input validation and documentation
amenity_input_model = api.model('Amenity', {
    'name': fields.String(required=True, description='Name of the amenity')
})

amenity_output_model = api.model('Amenity', {
    'id': fields.String(),
    'name': fields.String()
})

@api.route('/')
class AmenityList(Resource):
    @admin_required
    @api.expect(amenity_input_model)
    @api.response(201, 'Amenity successfully created')
    @api.response(400, 'Invalid input data')
    def post(self):
        """Register a new amenity"""
        # Placeholder for the logic to register a new amenity
        new_amenity = api.payload

        try:
            amenity = facade.amenity_facade.create_amenity(new_amenity)
            return api.marshal(amenity, amenity_output_model), 201
        except InvalidAmenityData:
            return {'error': 'Invalid input data'}, 400

    @api.response(200, 'List of amenities retrieved successfully')
    def get(self):
        """Retrieve a list of all amenities"""
        # Placeholder for logic to return a list of all amenities
        list = facade.amenity_facade.get_all_amenities()
        return api.marshal(list, amenity_output_model), 200

@api.route('/<amenity_id>')
class AmenityResource(Resource):
    @api.response(200, 'Amenity details retrieved successfully')
    @api.response(404, 'Amenity not found')
    def get(self, amenity_id):
        """Get amenity details by ID"""
        # Placeholder for the logic to retrieve an amenity by ID
        try:
            amenity = facade.amenity_facade.get(amenity_id)
            return api.marshal(amenity, amenity_output_model), 200
        except AmenityNotFound:
            return {'error': 'Amenity not found'}, 404

    @admin_required
    @api.expect(amenity_input_model)
    @api.response(200, 'Amenity updated successfully')
    @api.response(404, 'Amenity not found')
    @api.response(400, 'Invalid input data')
    def put(self, amenity_id):
        """Update an amenity's information"""
        # Placeholder for the logic to update an amenity by ID
        try:
            amenity = facade.amenity_facade.get(amenity_id)        
            facade.amenity_facade.update_amenity(amenity_id, api.payload)
            return api.marshal(amenity, amenity_output_model), 200
        except AmenityNotFound:
            return {'error': 'Amenity not found'}, 404
        except AmenityAlreadyExists:
            return {'error': 'Amenity already registered'}, 400
        except InvalidAmenityData:
            return {'error': 'Invalid input data'}, 400
