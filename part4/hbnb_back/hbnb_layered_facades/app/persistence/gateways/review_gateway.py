from app.persistence.gateways.repository import SQLAlchemyRepository

class ReviewGateway(SQLAlchemyRepository):
    def __init__(self):
        from app.models.review_model import Review
        super().__init__(Review)

    def get_all_reviews_by_place(self, place_id):
        return self.model.query.filter_by(**{'place_id': place_id}).all()
