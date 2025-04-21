from flask_restx import Namespace, Resource, fields
from app.services import facade
from app.api.v1.authentication_utils import (author_matches_or_admin,
                                             not_owner_first_review)
from app.services.exception import (InvalidReviewData, ReviewNotFound,
                                    PlaceNotFound)

api = Namespace('reviews', description='Review operations')

# Define the review model for input validation and documentation
review_input_model = api.model('ReviewInput', {
    'text': fields.String(required=True, description='Text of the review'),
    'rating': fields.Integer(required=True,
                             description='Rating of the place (1-5)'),
    'user_id': fields.String(required=True, description='ID of the user'),
    'place_id': fields.String(required=True, description='ID of the place')
})
review_output_model = api.model('ReviewOutput', {
    'id': fields.String(description='Review ID'),
    'text': fields.String(required=True, description='Text of the review'),
    'rating': fields.Integer(required=True,
                             description='Rating of the place (1-5)')
})
review_details_model = api.model('ReviewDetails', {
    'id': fields.String(description='Review ID'),
    'text': fields.String(required=True, description='Text of the review'),
    'rating': fields.Integer(required=True,
                             description='Rating of the place (1-5)'),
    'user_id': fields.String(required=True, description='ID of the user'),
    'place_id': fields.String(required=True, description='ID of the place')
})

@api.route('/')
class ReviewList(Resource):
    @not_owner_first_review
    @api.expect(review_input_model, validate=True)
    @api.response(201, 'Review successfully created')
    @api.response(400, 'Invalid input data')
    def post(self):
        """Register a new review"""
        try:
            review = facade.review_manager.create_review(api.payload)
            return api.marshal(review, review_output_model), 201
        except InvalidReviewData:
            api.abort(400, error='Invalid input data')

    @api.response(200, 'List of reviews retrieved successfully')
    def get(self):
        """Retrieve a list of all reviews"""
        return api.marshal(
            facade.review_facade.get_all_reviews(), review_output_model), 200

@api.route('/<review_id>')
@api.doc(params={'review_id': 'The review ID'})
class ReviewResource(Resource):
    @api.response(200, 'Review details retrieved successfully')
    @api.response(404, 'Review not found')
    @api.marshal_with(review_details_model, code=200)
    def get(self, review_id):
        """Get review details by ID"""
        try:
            review = facade.review_facade.get(review_id)
            return review, 200
        except ReviewNotFound:
            api.abort(404, error='Review not found')

    @author_matches_or_admin
    @api.expect(review_input_model)
    @api.response(200, 'Review updated successfully')
    @api.response(404, 'Review not found')
    @api.response(400, 'Invalid input data')
    def put(self, review_id):
        """Update a review's information"""
        try:
            facade.review_facade.update_review(review_id, api.payload)
            return {"message": "Review updated successfully"}, 200
        except ReviewNotFound:
            return {'error': 'Review not found'}, 404
        except InvalidReviewData:
            return {'error': 'Invalid input data'}, 400

    @author_matches_or_admin
    @api.response(200, 'Review deleted successfully')
    @api.response(404, 'Review not found')
    def delete(self, review_id):
        """Delete a review"""
        try:
            facade.review_facade.delete_review(review_id)
            return {"message": "Review deleted successfully"}, 200
        except ReviewNotFound:
            api.abort(404, error='Review not found')
            

@api.route('/places/<place_id>/reviews')
@api.doc(params={'place_id': 'The place ID'})
class PlaceReviewList(Resource):
    @api.response(200, 'List of reviews for the place retrieved successfully')
    @api.response(404, 'Place not found')
    @api.marshal_list_with(review_output_model, code=200)
    def get(self, place_id):
        """Get all reviews for a specific place"""
        try:
            reviews = facade.review_facade.gateway.get_by_attribute(
                'place_id', place_id)
            return reviews
        except PlaceNotFound:
            api.abort(404, error="Place not found")