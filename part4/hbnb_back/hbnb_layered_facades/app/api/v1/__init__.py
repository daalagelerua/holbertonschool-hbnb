from flask import Blueprint
from flask_restx import Api

# Create a Blueprint for v1 API
api_v1 = Blueprint('api_v1', __name__, url_prefix='/api/v1')

# Create RestX API and associate it with the Blueprint
authorizations = {
    'Bearer Auth': {
        'type': 'apiKey',
        'in': 'header',
        'name': 'Authorization',
        'description': 'Add a JWT token to the header with Bearer prefix'
    }
}

api = Api(
    api_v1,
    version='1.0',
    title='HBnB API',
    description='HBnB Application API',
    doc='/',
    authorizations=authorizations,
    security='Bearer Auth'
)

# Import and register namespaces
from app.api.v1.authentication_endpoints import api as auth_ns
from app.api.v1.user_endpoints import api as users_ns
from app.api.v1.place_endpoints import api as places_ns
from app.api.v1.review_endpoints import api as reviews_ns
from app.api.v1.amenity_endpoints import api as amenities_ns

api.add_namespace(auth_ns, path='/')
api.add_namespace(users_ns, path='/users')
api.add_namespace(places_ns, path='/places')
api.add_namespace(reviews_ns, path='/reviews')
api.add_namespace(amenities_ns, path='/amenities')