from app.persistence.gateways.user_gateway import UserGateway
from app.models.user_model import User
from app.services.exception import (EmailAlreadyExists, InvalidUserData,
                                    UserNotFound, ReviewNotFound)

class UserFacade:
    def __init__(self):
        self.gateway = UserGateway()

    def create_user(self, user_data):
        if self.gateway.get_by_attribute('email', user_data['email'])\
            is not None:
            raise EmailAlreadyExists

        if self.is_valid(user_data) == False:
            raise InvalidUserData
        user = User(**user_data)

        return self.gateway.add(user)

    def get_all_users(self):
        users = self.gateway.get_all()
        return [
        {
                'id': user.id, 
                'first_name': user.first_name, 
                'last_name': user.last_name, 
                'email': user.email
        } 
        for user in users
    ]

    def update_user(self, user, user_data):
        # retreive user updating his profile
        updating_user = self.gateway.get_by_attribute('id', user.id)
        if not updating_user:
            raise UserNotFound
        # retreiving user associated with email if any
        if 'email' in user_data.keys():
            existing_email = self.gateway.get_by_attribute(
                'email', user_data['email'])
            # Either email is not registered, or registered email matches user
            if existing_email and updating_user.id != existing_email.id:
                raise EmailAlreadyExists
        # checking format validation before writing into storage
        if self.is_valid(user_data) == True:
            updating_user.update(user_data)
            return updating_user
        else:
            raise InvalidUserData

    def get(self, user_id):
        user = self.gateway.get(user_id)
        if user is None:
            raise UserNotFound
        return user

    def delete_review(self, review_id, user_id):
        user = self.get(user_id)
        self.gateway.delete_review(user, review_id)
        if review_id in user.reviews:
            raise ReviewNotFound
        return user

    def is_valid(self, data):
        from email_validator import validate_email, EmailNotValidError

        if 'first_name' in data.keys() and type(data['first_name']) is not str:
            raise InvalidUserData

        if 'last_name' in data.keys() and type(data['last_name']) is not str:
            raise InvalidUserData

        if 'first_name' in data.keys() and (len(data['first_name']) > 50 or
            len(data['first_name']) < 1):
                raise InvalidUserData

        if 'last_name' in data.keys() and (len(data['last_name']) > 50 or
            len(data['last_name']) < 1):
                raise InvalidUserData

        if 'is_admin' in data.keys() and type(data['is_admin']) is not bool:
            raise InvalidUserData

        try:
            if 'email' in data.keys():
                emailinfo = validate_email(data['email'],
                                           check_deliverability=True)
                data['email'] = emailinfo.normalized
            return True
        except (EmailNotValidError, AttributeError):
            raise InvalidUserData