from app.models.base_model import SQLBaseModel
from app import db
from app.models.associations import place_amenity

class Amenity(SQLBaseModel):
    __tablename__ = 'amenities'

    name = db.Column(db.Text, nullable=False, unique=True)

    places = db.relationship('Place', secondary=place_amenity,
                             back_populates='amenities')
    
    def __init__(self, name):
        self.name = name
        # Constructor doesn't need to initialize places - SQLalchemy does that

    # A revoir
    def add_places(self, place):
        self.places.append(place)

    def update(self, data=None):
        if not data:
            return self
        updatable_attr = ['name']
        for key in data:
            if key in updatable_attr:
                setattr(self, key, data[key])
        return self