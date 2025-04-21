from app.services.exception import (UserNotFound, PlaceNotFound,
                                    InvalidReviewData, ReviewNotFound)
from app.models.review_model import Review

class ReviewWorkflowManager:
    def __init__(self, place_facade, user_facade, review_facade):
        self.place_facade = place_facade
        self.user_facade = user_facade
        self.review_facade = review_facade
    
    # A revoir lors de l'implémentation DB
    def create_review(self, data):
        try:
            self.user_facade.get(data['user_id'])
            self.place_facade.get(data['place_id'])
            self.review_facade.is_valid(data)
            review = Review(
                user_id=data['user_id'],
                place_id=data['place_id'],
                text=data['text'],
                rating=data['rating']
            )
            self.review_facade.gateway.add(review)
            return review
        except UserNotFound:
            raise UserNotFound
        except (PlaceNotFound, InvalidReviewData):
            raise InvalidReviewData

    def get_reviews_by_place(self, place_id):
        try:
            reviews = (self.place_facade.get(place_id)).reviews
            reviews_list=[]
            for review in reviews:
                reviews_list.append(self.review_facade.get(review))
            return reviews_list
        except PlaceNotFound:
            raise PlaceNotFound
