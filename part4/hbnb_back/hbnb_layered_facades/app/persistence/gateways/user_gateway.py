from app.persistence.gateways.repository import SQLAlchemyRepository


class UserGateway(SQLAlchemyRepository):
    def __init__(self):
        from app.models.user_model import User
        super().__init__(User)


    # A revoir
    def delete_review(self, obj, review_id):
        (obj.reviews).remove(review_id)
        return obj

    # A revoir
    def delete_place(self, owner, place_id):
        owner.places.remove(place_id)
        return owner
