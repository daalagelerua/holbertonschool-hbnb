from app import db


place_amenity = db.Table('place_amenity',
                         db.Column('place_id',
                                   db.String,
                                   db.ForeignKey('places.id'),
                                   primary_key=True),
                         db.Column('amenity_id',
                                   db.String,
                                   db.ForeignKey('amenities.id'),
                                   primary_key=True)
)