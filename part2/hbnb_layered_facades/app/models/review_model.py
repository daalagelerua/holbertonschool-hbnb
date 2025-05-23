from app.models.base_model import BaseEntity

class Review(BaseEntity):
    def __init__(self, text, rating, place_id, user_id):
        super().__init__()
        self.text = text
        self.rating = rating
        self.place_id = place_id
        self.user_id = user_id
    
    def update(self, data=None):
        super().update()
        if not data:
            return self
        updatable_attr = ['text', 'rating']
        for key in data:
            if key in updatable_attr:
                setattr(self, key, data[key])
        return self