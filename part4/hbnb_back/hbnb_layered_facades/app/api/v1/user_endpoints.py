from flask_restx import Namespace, Resource, fields
from app.services import facade
from flask_jwt_extended import get_jwt
from app.api.v1.authentication_utils import (admin_required,
                                             user_matches_or_admin)
from app.services.exception import (EmailAlreadyExists, InvalidUserData,
                                    UserNotFound)

# Defines /users api route, adds documentation for swagger (description)
api = Namespace('users', description='User operations')

# Define the user model for input validation and documentation
user_input_model = api.model('User', {
    'first_name': fields.String(
        required=True,
        description='First name of the user'),
    'last_name': fields.String(
        required=True,
        description='Last name of the user'),
    'email': fields.String(
        required=True,
        description='Email of the user'),
    'password': fields.String(
        required=True,
        description='Password of the user')
})

user_output_model = api.model('User', {
    'id': fields.String(),
    'first_name': fields.String(),
    'last_name': fields.String(),
    'email': fields.String()
})

@api.route('/')  # Incomming API call to localhost:5000/users
# Must define all HTTP methods handled by previously defined route (/users)
class UserList(Resource):
    @admin_required
    # validates incomming payload / body
    @api.expect(user_input_model, validate=True)
    @api.response(201, 'User successfully created')  # Swagger documentation
    @api.response(400, 'Email already registered')
    @api.response(400, 'Invalid input data')
    def post(self):
        """Register a new user"""
        # Retrieves validated request data / payload / body as dict object
        user_data = api.payload

        try:
            user = facade.user_facade.create_user(user_data)
            return {
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email
            }, 201
        except EmailAlreadyExists:
            return {'error': 'Email already registered'}, 400
        except InvalidUserData:
            return {'error': 'Invalid input data'}, 400

    @admin_required  # decorator performs token check in place of jwt_required()
    @api.response(200, 'Users list retrieved successfully')
    def get(self):
        """Retrieve list of users requires admin access token"""
        user_list = facade.user_facade.gateway.get_all()
        # Serialize user_list to user_output_model
        return api.marshal(user_list, user_output_model), 200

@api.route('/<user_id>')
# user_id comes from route, not payload / body
@api.doc(params={'user_id': 'The user ID'})
class UserResource(Resource):
    @user_matches_or_admin  # Same as line 55
    @api.response(200, 'User details retrieved successfully')
    @api.response(404, 'User not found')
    def get(self, user_id):
        """Get user details by ID requires a user matching JWT token"""
        try:
            current_user = get_jwt()
            user = facade.user_facade.get(user_id)
            return {"message": f"Hello, user {current_user['sub']}"}, 200
        except UserNotFound:
            return {'error': 'User not found'}, 404

    @user_matches_or_admin  # Same as line 55
    @api.expect(user_input_model)
    @api.response(200, 'User details updated successfully')
    @api.response(404, 'User not found')
    @api.response(400, 'Email already registered')
    @api.response(400, 'Invalid input data')
    def put(self, user_id):
        """Update one user details requires user matching token or admin
        rights"""
        try:
            uptd_user = facade.user_facade.update_user(user_id, api.payload)
            return api.marshal(uptd_user, user_output_model), 200
        except UserNotFound:
            return {'error': 'User not found'}, 404
        except EmailAlreadyExists:
            return {'error': 'Email already registered'}, 400
        except InvalidUserData:
            return {'error': 'Invalid input data'}, 400
