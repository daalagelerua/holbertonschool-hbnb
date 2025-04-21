from app.models.base_model import SQLBaseModel
from app import db

class Review(SQLBaseModel):
    __tablename__ = 'reviews'

    text = db.Column(db.Text, nullable=False)
    rating = db.Column(db.Integer, nullable=False)

    user_id = db.Column(
        db.String,
        db.ForeignKey('users.id', ondelete='SET NULL'),
        nullable=True
    )

    place_id = db.Column(
        db.String,
        db.ForeignKey('places.id', ondelete='CASCADE'), # answers the 'cascade' param on parent side
        nullable=False
    )

    user = db.relationship(
        'User',
        back_populates='reviews'
    )
    place = db.relationship(
        'Place',
        back_populates='reviews'
    )

    def __init__(self, text, rating, place_id, user_id):
        self.text = text
        self.rating = rating
        self.place_id = place_id
        self.user_id = user_id
    
    def update(self, data=None):
        if not data:
            return self
        updatable_attr = ['text', 'rating']
        for key in data:
            if key in updatable_attr:
                setattr(self, key, data[key])
        return self