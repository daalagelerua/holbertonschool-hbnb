import unittest
from app import create_app

class TestReviewEndpoints(unittest.TestCase):
    """Tests des endpoints API reviews"""
    
    user_id = None
    owner_id = None
    place_id = None
    review_id = None
    
    @classmethod
    def setUpClass(cls):
        """Setup that runs once before all tests"""
        app = create_app()
        client = app.test_client()
        
        # Creation du user
        user_response = client.post('/api/v1/users/', json={
            "first_name": "Joe",
            "last_name": "Average",
            "email": "joe.average.test@gmail.com"  # Unique email for tests
        })

        assert user_response.status_code == 201, "Failed to create test user"
        response_data = user_response.get_json()
        cls.user_id = response_data.get("id")

        # Creation du owner
        user_response = client.post('/api/v1/users/', json={
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane.doe.test@gmail.com"  # Unique email for tests
        })

        assert user_response.status_code == 201, "Failed to create test user"
        response_data = user_response.get_json()
        cls.owner_id = response_data.get("id")
        
        place_response = client.post('/api/v1/places/', json={
            "title": "Test Villa",
            "description": "For testing",
            "price": 100.0,
            "latitude": 40.0,
            "longitude": 70.0,
            "owner_id": cls.owner_id
        })
        assert place_response.status_code == 201, "Failed to create test place"
        cls.place_id = place_response.get_json().get("id")

    def setUp(self):
        """Initialisation du client de test"""
        self.app = create_app()
        self.client = self.app.test_client()

    def test_01_create_review(self):
        """Test: création d'une review"""
        # Création d'une review
        response = self.client.post('/api/v1/reviews/', json={
            "text": "Super séjour dans cet appartement !",
            "rating": 5,
            "user_id": f"{self.__class__.user_id}",
            "place_id": f"{self.__class__.place_id}"
        })
        self.assertEqual(response.status_code, 201)
        review_data = response.get_json()
        self.assertEqual(review_data["text"],
                         "Super séjour dans cet appartement !")
        self.assertEqual(review_data["rating"], 5)
        self.__class__.review_id = response.get_json().get('id')
        
    def test_02_create_review_invalid_rating(self):
        """Test: création d'une review"""
        # Création d'une review
        response = self.client.post('/api/v1/reviews/', json={
            "text": "Super séjour dans cet appartement !",
            "rating": 7,
            "user_id": f"{self.__class__.user_id}",
            "place_id": f"{self.__class__.place_id}"
        })
        self.assertEqual(response.status_code, 400)
        response_data = response.get_json()
        self.assertIn('error', response_data)
        self.assertEqual(response_data['error'], "Invalid input data")

    def test_03_create_review_invalid_rating(self):
        """Test: création d'une review"""
        # Création d'une review
        response = self.client.post('/api/v1/reviews/', json={
            "text": "",
            "rating": 4,
            "user_id": f"{self.__class__.user_id}",
            "place_id": f"{self.__class__.place_id}"
        })
        self.assertEqual(response.status_code, 400)
        response_data = response.get_json()
        self.assertIn('error', response_data)
        self.assertEqual(response_data['error'], "Invalid input data")

    def test_04_get_all_reviews(self):
        """Test: obtenir toutes les reviews"""
        response = self.client.get('/api/v1/reviews/')
        self.assertEqual(response.status_code, 200)
        reviews = response.get_json()
        self.assertIsInstance(reviews, list)
        self.assertEqual(len(reviews), 1)
        self.assertEqual(reviews[0].get('id'), self.__class__.review_id)

    def test_05_get_reviews_by_place(self):
        """Test: obtenir les reviews d'une place spécifique"""
        response = self.client.get(
            f'/api/v1/reviews/places/{self.__class__.place_id}/reviews')
        self.assertEqual(response.status_code, 200)
        reviews = response.get_json()
        self.assertIsInstance(reviews, list)
        self.assertEqual(reviews[0]["id"], self.__class__.review_id)

    def test_06_delete_review(self):
        """Test: suppression d'une review"""
        # Suppression de la review
        delete_response = self.client.delete(
            f'/api/v1/reviews/{self.__class__.review_id}')
        self.assertEqual(delete_response.status_code, 200)
        delete_data = delete_response.get_json()
        self.assertEqual(delete_data['message'], "Review deleted successfully")

        # Vérification que la review a bien été supprimée
        get_response = self.client.get(
            f'/api/v1/reviews/{self.__class__.review_id}')
        self.assertEqual(get_response.status_code, 404)
        response_data = get_response.get_json()
        self.assertIn('error', response_data)
        self.assertEqual(response_data['error'], "Review not found")

    def test_07_delete_nonexistent_review(self):
        """Test: suppression d'une review inexistante"""
        response = self.client.delete('/api/v1/reviews/99999')
        self.assertEqual(response.status_code, 404)
        response_data = response.get_json()
        self.assertIn('error', response_data)
        self.assertEqual(response_data['error'], "Review not found")

    @classmethod
    def tearDownClass(cls):
        """Clean up after all tests"""
        if cls.review_id:
            app = create_app()
            client = app.test_client()
            # Delete the review
            client.delete(f'/api/v1/reviews/{cls.review_id}')

        if cls.owner_id:
            app = create_app()
            client = app.test_client()
            # Delete the owner
            client.delete(f'/api/v1/users/{cls.owner_id}')

        if cls.place_id:
            app = create_app()
            client = app.test_client()
            # Delete the place
            client.delete(f'/api/v1/places/{cls.place_id}')

        if cls.user_id:
            app = create_app()
            client = app.test_client()
            # Delete the test user
            client.delete(f'/api/v1/users/{cls.place_id}')

if __name__ == '__main__':
    unittest.main()