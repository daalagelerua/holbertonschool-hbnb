# HBnB Evolution part 2
This README is meant as a reminder of the architecture and design of a simplified version of an AirBnB-like application, named HBnB Evolution. The application will allow users to perform the following primary operations:
1. **User Management**: Users can register, update their profiles, and be identified as either regular users or administrators.
2. **Place Management**: Users can list properties (places) they own, specifying details such as name, description, price, and location (latitude and longitude). Each place can also have a list of amenities.
3. **Review Management**: Users can leave reviews for places they have visited, including a rating and a comment.
4. **Amenity Management**: The application will manage amenities that can be associated with places.

# Business Rules and Requirements
1. **User Entity**
   * Each user has a `first name`, `last name`, `email`, and `password`.
   * Users can be identified as administrators through a `boolean` attribute.
   * Users should be able to register, update their profile information, and be deleted.
2. **Place Entity**
   * Each place has a `title`, `description`, `price`, `latitude`, and `longitude`.
   * Places are associated with the user who created them (`owner`).
   * Places can have a **list of amenities**.
   * Places can be created, updated, deleted, and listed.
3. **Review Entity**
   * Each review is associated with a specific `place` and `user`, and includes a `rating` and `comment`.
   * Reviews can be created, updated, deleted, and listed by place.
4. **Amenity Entity**
   * Each amenity has a `name`, and `description`.
   * Amenities can be created, updated, deleted, and listed.
* Each object should be uniquely identified by an ID.
* For audit reasons, the creation and update datetime should be registered for all entities.

# Project architecture
```
hbnb_layered_facades/
├── README.md
├── app/
│   ├── __init__.py
│   ├── api/
│   │   ├── __init__.py
│   │   └── v1/
│   │       ├── __init__.py
│   │       ├── amenity_endpoints.py
│   │       ├── place_endpoints.py
│   │       ├── review_endpoints.py
│   │       └── user_endpoints.py
│   ├── models/
│   │   ├── __init__.py
│   │   ├── amenity_model.py
│   │   ├── base_model.py
│   │   ├── place_model.py
│   │   ├── review_model.py
│   │   └── user_model.py
│   ├── persistence/
│   │   ├── __init__.py
│   │   └── gateways/
│   │       ├── amenity_gateway.py
│   │       ├── place_gateway.py
│   │       ├── repository.py
│   │       ├── review_gateway.py
│   │       └── user_gateway.py
│   └── services/
│       ├── __init__.py
│       ├── app_facade.py
│       ├── cross_entity_managers/
│       │   ├── __init__.py
│       │   └── review_workflow_manager.py
│       └── facades/
│           ├── __init__.py
│           ├── amenity_facade.py
│           ├── base_facade.py
│           ├── place_facade.py
│           ├── review_facade.py
│           └── user_facade.py
├── config.py
├── requirements.txt
├── run.py
├── test_amenity.py
├── test_place_review.py
└── test_user.py
```

# Testing

Entity classes' objects are tested through the three test files.

## User class

```python
from app.models.user_model import User

def test_user_creation():
    user = User(first_name="John", last_name="Doe", email="john.doe@example.com")
    assert user.first_name == "John"
    assert user.last_name == "Doe"
    assert user.email == "john.doe@example.com"
    assert user.is_admin is False  # Default value
    print(user.__dict__)
    print("User creation test passed!")

test_user_creation()
```

## Place class and its relationships

```python
from app.models.place_model import Place
from app.models.user_model import User
from app.models.review_model import Review

def test_place_creation():
    owner = User(first_name="Alice", last_name="Smith", email="alice.smith@example.com")
    place = Place(title="Cozy Apartment", description="A nice place to stay", price=100, latitude=37.7749, longitude=-122.4194, owner=owner)

    # Adding a review
    review = Review(text="Great stay!", rating=5, place=place, author=owner)
    place.add_review(review)

    assert place.title == "Cozy Apartment"
    assert place.price == 100
    assert len(place.reviews) == 1
    assert place.reviews[0].text == "Great stay!"
    print("Place creation and relationship test passed!")

test_place_creation()
```

## Amenity class

```python
from app.models.amenity import Amenity

def test_amenity_creation():
    amenity = Amenity(name="Wi-Fi")
    assert amenity.name == "Wi-Fi"
    print("Amenity creation test passed!")

test_amenity_creation()
```