from app.services.facades.user_facade import UserFacade
from app.services.facades.place_facade import PlaceFacade
from app.services.facades.review_facade import ReviewFacade
from app.services.facades.amenity_facade import AmenityFacade
from app.services.cross_entity_managers.place_workflow_manager \
    import PlaceWorkflowManager
from app.services.cross_entity_managers.review_workflow_manager \
    import ReviewWorkflowManager

class HBnBFacade:
    def __init__(self):
        self.user_facade = UserFacade()
        self.place_facade = PlaceFacade()
        self.review_facade = ReviewFacade()
        self.amenity_facade = AmenityFacade()
        self.place_manager = PlaceWorkflowManager(
            self.place_facade,
            self.user_facade,
            self.amenity_facade,
            self.review_facade
        )
        self.review_manager = ReviewWorkflowManager(
            self.place_facade,
            self.user_facade,
            self.review_facade
        )