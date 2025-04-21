from app.models.base_model import SQLBaseModel
from app import db, bcrypt


class User(SQLBaseModel):
    __tablename__ = 'users'

    first_name = db.Column(db.String(50), nullable=False)
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(120), nullable=False, unique=True)
    password = db.Column(db.String(128), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)

    places = db.relationship(
        'Place',
        back_populates='owner',
        # parent-side only below
        lazy='select',  # Select is the default lazy mode
        cascade='all, delete-orphan'
    )
    reviews = db.relationship(
        'Review',
        back_populates='user',
        # parent-side only below
        lazy='select',  # Select is the default lazy mode
        cascade="save-update, merge, refresh-expire"  # keep reviews on deletion
    )

    def __init__(self, first_name, last_name, email, password, is_admin=False):
        self.first_name = first_name
        self.last_name = last_name
        self.email = email
        self.is_admin = is_admin
        self.hash_password(password)

    def hash_password(self, password):
        """Hashes the password before storing it."""
        self.password = bcrypt.generate_password_hash(password).decode('utf-8')
    
    def verify_password(self, password):
        """Verifies if the provided password matches the hashed password."""
        return bcrypt.check_password_hash(self.password, password)
        
    def update(self, data=None):
        if not data:
            return self
        updatable_attr = ['first_name', 'last_name', 'email', 'password']
        for key in data:
            if key in updatable_attr:
                setattr(self, key, data[key])
        if 'reviews' in data.keys():
            for review in data['reviews']:
                self.reviews.append(review)
        if 'places' in data.keys():
            for place in data['places']:
                self.places.append(place)
        return self
