import unittest
from app import create_app

class TestPlaceEndpoints(unittest.TestCase):
    """Tests des endpoints API places"""
    
    owner_id = None
    place_id = None
    
    @classmethod
    def setUpClass(cls):
        """Setup that runs once before all tests"""
        app = create_app()
        client = app.test_client()
        
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
        self.app = create_app()
        self.client = self.app.test_client()

    def test_create_place(self):
        """Test: création d'un lieu"""
        response = self.client.post('/api/v1/places/', json={
            "title": "Villa Paradiso",
            "description": "paradisiac",
            "price": 120.0,
            "latitude": 40.0,
            "longitude": 70.0,
            "owner_id": f"{self.__class__.owner_id}"
        })
        self.assertEqual(response.status_code, 201)

        data = response.get_json()
        self.assertIsNotNone(data)  # Vérifie que réponse pas None
        self.assertEqual(data['title'], 'Villa Paradiso')
        self.assertIsNotNone(data['id'])  # Vérifie que l'ID est bien présent
    
    def test_create_place_owner_not_found(self):
        """Test: création d'un lieu, owner inconnu"""
        response = self.client.post('/api/v1/places/', json={
            "title": "Villa Paradiso",
            "description": "paradisiac",
            "price": 120.0,
            "latitude": 40.0,
            "longitude": 70.0,
            "owner_id": "1234"
        })
        self.assertEqual(response.status_code, 404)
        response_data = response.get_json()
        self.assertIn('error', response_data)
        self.assertEqual(response_data['error'], 'Owner not found')
        
    def test_create_place_invalid_data(self):
        """Test: création d'un lieu, owner inconnu"""
        response = self.client.post('/api/v1/places/', json={
            "title": "Villa Paradiso",
            "description": "paradisiac",
            "price": -120.0,
            "latitude": 40.0,
            "longitude": 70.0,
            "owner_id": f"{self.__class__.owner_id}"
        })
        self.assertEqual(response.status_code, 400)
        response_data = response.get_json()
        self.assertIn('error', response_data)
        self.assertEqual(response_data['error'], 'Invalid input data')
        get_response = self.client.get('/api/v1/places/')
        self.assertEqual(get_response.status_code, 200)
        places = get_response.get_json()
        self.assertIsInstance(places, list)
        self.assertEqual(len(places), 2)
        

    def test_get_place(self):
        """Test: récupérer un lieu existant"""
        get_response = self.client.get(
            f'/api/v1/places/{self.__class__.place_id}')
        self.assertEqual(get_response.status_code, 200)

        data = get_response.get_json()
        self.assertEqual(data["title"], "Test Villa")

    def test_get_all_places(self):
        """Test: obtenir toutes les places"""
        response = self.client.get('/api/v1/places/')
        self.assertEqual(response.status_code, 200)
        places = response.get_json()
        self.assertIsInstance(places, list)  # Vérifie que réponse est une liste
        if places:  # Vérifie que si places existent, ont bien les bons champs
            for place in places:
                self.assertIn('id', place)
                self.assertIn('title', place)
                self.assertIn('latitude', place)
                self.assertIn('longitude', place)

    def test_update_place(self):
        # Mise à jour de la place
        update_response = self.client.put(
            f'/api/v1/places/{self.__class__.place_id}',
            json={
                "title": "Appartement 2 chambres",
                "description": "Plus grand et mieux situé",
                "price": 150.0,
                "latitude": 48.8584,
                "longitude": 2.2945,
                "owner_id": f"{self.__class__.owner_id}"
            })
        self.assertEqual(update_response.status_code, 200)
        updated_data = update_response.get_json()
        self.assertEqual(updated_data['message'], 'Place updated successfully')
        get_response = self.client.get(
            f'/api/v1/places/{self.__class__.place_id}')
        self.assertEqual(get_response.status_code, 200)
        get_data = get_response.get_json()
        self.assertEqual(get_data['title'], "Appartement 2 chambres")
        self.assertEqual(get_data['description'], "Plus grand et mieux situé")
        self.assertEqual(get_data['price'], 150.0)
        self.assertEqual(get_data['latitude'], 48.8584)
        self.assertEqual(get_data['longitude'], 2.2945)
        

    def test_update_nonexistent_place(self):
        """Test: mise à jour d'une place inexistante"""
        response = self.client.put('/api/v1/places/99999', json={
            "title": "Appartement 3 chambres",
            "description": "Spacieux et moderne",
            "price": 200,
            "latitude": 48.8600,
            "longitude": 2.2950,
            "owner_id": f"{self.__class__.owner_id}"
        })
        self.assertEqual(response.status_code, 404)
        updated_data = response.get_json()
        self.assertEqual(updated_data['error'], 'Place not found')

    def test_update_place_invalid_price(self):
        """Test: tentative de mise à jour avec des données invalides"""
        # Tentative de mise à jour avec un prix négatif
        update_response = self.client.put(
            f'/api/v1/places/{self.__class__.place_id}',
            json={
                "title": "Appartement 2 chambres",
                "description": "Plus grand et mieux situé",
                "price": -150.0,
                "latitude": 48.8584,
                "longitude": 2.2945,
                "owner_id": f"{self.__class__.owner_id}"
            })
        self.assertEqual(update_response.status_code, 400)
        response_data = update_response.get_json()
        self.assertIn('error', response_data)
        self.assertEqual(response_data['error'], 'Invalid input data')
        get_response = self.client.get(
            f'/api/v1/places/{self.__class__.place_id}')
        self.assertEqual(get_response.status_code, 200)
        place = get_response.get_json()
        assert place['price'] != -150.0, "Failed to preserve original price"
        
    def test_update_place_invalid_coordinates(self):
        """Test: tentative de mise à jour avec des données invalides"""
        # Tentative de mise à jour avec un prix négatif
        update_response = self.client.put(
            f'/api/v1/places/{self.__class__.place_id}',
            json={
                "title": "Appartement 2 chambres",
                "description": "Plus grand et mieux situé",
                "price": 150.0,
                "latitude": -94.2468,
                "longitude": 190.1234,
                "owner_id": f"{self.__class__.owner_id}"
            })
        self.assertEqual(update_response.status_code, 400)
        response_data = update_response.get_json()
        self.assertIn('error', response_data)
        self.assertEqual(response_data['error'], 'Invalid input data')

    # make or break ?
    def test_update_place_invalid_owner(self):
        """Test: tentative de mise à jour avec des données invalides"""
        # Tentative de mise à jour avec un prix négatif
        update_response = self.client.put(
            f'/api/v1/places/{self.__class__.place_id}',
            json={
                "title": "Appartement 2 chambres",
                "description": "Plus grand et mieux situé",
                "price": 150.0,
                "latitude": 47.2468,
                "longitude": 50.1234,
                "owner_id": "1234"
            })
        self.assertEqual(update_response.status_code, 400)
        response_data = update_response.get_json()
        self.assertIn('error', response_data)
        self.assertEqual(response_data['error'], "Can't change place owner")
        
    @classmethod
    def tearDownClass(cls):
        """Clean up after all tests"""
        if cls.owner_id:
            app = create_app()
            client = app.test_client()
            # Delete the test user
            client.delete(f'/api/v1/users/{cls.owner_id}')

        if cls.place_id:
            app = create_app()
            client = app.test_client()
            # Delete the test user
            client.delete(f'/api/v1/users/{cls.place_id}')

if __name__ == '__main__':
    unittest.main()