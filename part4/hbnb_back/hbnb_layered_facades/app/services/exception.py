class UserError(Exception):
    """Base exception for user-related errors"""
    pass

class PlaceError(Exception):
    """Base exception for place-related errors"""
    pass

class AmenityError(Exception):
    """Base exception for amenity-related errors"""
    pass

class ReviewError(Exception):
    """Base exception for review-related errors"""
    pass

class AuthenticationError(Exception):
    """Base exception for authentication error"""
    pass

class EmailAlreadyExists(UserError):
    """Raised when attempting to register with an existing email"""
    pass

class InvalidUserData(UserError):
    """Raised when user data is invalid"""
    pass

class UserNotFound(UserError):
    """Raised when user is not found in storage"""
    pass

class UserWithoutPlace(UserError):
    """Raised when attempting to delete place unregistered to user obj"""
    pass

class InvalidAmenityData(AmenityError):
    """Raised when amenity data is invalid."""
    pass

class AmenityAlreadyExists(AmenityError):
    """Raised when attempting to register an existing amenity"""
    pass
class AmenityNotFound(AmenityError):
    """Raised when amenity is not found in storage"""
    pass
class InvalidPlaceData(PlaceError):
    """Raised when place data is invalid"""
    pass
class PlaceNotFound(PlaceError):
    pass

class PlaceOwnerConsistency(PlaceError):
    pass

class OwnerNotFound(PlaceError):
    pass

class ReviewNotFound(ReviewError):
    pass

class InvalidReviewData(ReviewError):
    pass

class UnauthorizedAccess(AuthenticationError):
    pass