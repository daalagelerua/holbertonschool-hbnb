from flask_restx import Namespace, Resource, fields
from flask_jwt_extended import create_access_token
from app.services import facade
from app.services.exception import UserNotFound

api = Namespace('auth', description='Authentication operations')

# Model for input validation
login_model = api.model('Login', {
    'email': fields.String(required=True, description='User email'),
    'password': fields.String(required=True, description='User password')
})

@api.route('/login')
class Login(Resource):
    @api.expect(login_model)
    def post(self):
        """Authenticate user and return a JWT token"""
        try:
            credentials = api.payload  # Get the email and password from the request payload
            
            # Step 1: Retrieve the user based on the provided email
            user = facade.user_facade.gateway.get_by_attribute('email', credentials['email'])
            
            # Step 2: Check if the user exists and the password is correct
            if not user or not user.verify_password(credentials['password']):
                return {'error': 'Invalid credentials'}, 401

            # Step 3: Create a JWT token with the user's id and is_admin flag
            access_token = create_access_token(
                identity=str(user.id),
                additional_claims={
                    "is_admin": user.is_admin,
                    "email": user.email  # practical for debugging
                    }
                )
            
            # Step 4: Return the JWT token to the client
            return {'access_token': access_token}, 200
        except UserNotFound:
            return {'error': 'User not found'}, 404
