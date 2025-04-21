import unittest
from app import create_app

class TestAmenityEndpoints(unittest.TestCase):
    """Tests des endpoints API amenities"""

    def setUp(self):
        """Initialisation du client de test"""
        self.app = create_app()
        self.client = self.app.test_client()

    def test_create_amenity(self):
        """Test: création d'un équipement avec des données valides"""
        response = self.client.post('/api/v1/amenities/', json={
            "name": "WiFi"
        })
        self.assertEqual(response.status_code, 201)

        data = response.get_json()
        self.assertIn("id", data)  # Vérifie que l'ID est retourné
        self.assertEqual(data["name"], "WiFi")

    def test_create_amenity_invalid_data(self):
        """Test: tentative de création avec données invalides"""
        response = self.client.post('/api/v1/amenities/', json={
            "name": ""
        })
        self.assertEqual(response.status_code, 400)
        response_data = response.get_json()
        self.assertIn('error', response_data)
        self.assertEqual(response_data['error'], 'Invalid input data')

    def test_get_amenity(self):
        """Test: récupérer un équipement existant"""
        # Création d'un équipement
        create_response = self.client.post('/api/v1/amenities/', json={
            "name": "Piscine"
        })
        amenity_id = create_response.get_json().get("id")

        # Récupération de l'équipement
        get_response = self.client.get(f'/api/v1/amenities/{amenity_id}')
        self.assertEqual(get_response.status_code, 200)

        data = get_response.get_json()
        self.assertEqual(data["name"], "Piscine")

    def test_get_nonexistent_amenity(self):
        """Test: récupérer un équipement inexistant"""
        response = self.client.get('/api/v1/amenities/99999')
        self.assertEqual(response.status_code, 404)
        response_data = response.get_json()
        self.assertIn('error', response_data)
        self.assertEqual(response_data['error'], 'Amenity not found')

    def test_get_all_amenities(self):
        """Test: obtenir toutes les amenities"""
        response = self.client.get('/api/v1/amenities/')
        self.assertEqual(response.status_code, 200)
        amenities = response.get_json()
        self.assertIsInstance(amenities, list)  # Vérifie que réponse = liste
        if amenities:  # Vérifie que si amenities existent, ont les bons champs
            for amenity in amenities:
                self.assertIn('id', amenity)
                self.assertIn('name', amenity)

    def test_update_amenity(self):
        """Test: mise à jour d'un équipement"""
        # Création d'un équipement
        create_response = self.client.post('/api/v1/amenities/', json={
            "name": "WiFi"
        })
        amenity_data = create_response.get_json()
        amenity_id = amenity_data.get("id")

        # Mise à jour de l'équipement
        update_response = self.client.put(f'/api/v1/amenities/{amenity_id}',
                                            json={
            "name": "WiFi Ultra-Rapide"
        })
        self.assertEqual(update_response.status_code, 200)

        updated_data = update_response.get_json()
        self.assertEqual(updated_data["name"], "WiFi Ultra-Rapide")

    def test_update_nonexistent_amenity(self):
        """Test: mise à jour d'un équipement inexistant"""
        response = self.client.put('/api/v1/amenities/99999', json={
            "name": "Salle de sport"
        })
        self.assertEqual(response.status_code, 404)
        response_data = response.get_json()
        self.assertIn('error', response_data)
        self.assertEqual(response_data['error'], 'Amenity not found')

    def test_update_amenity_invalid_data(self):
        """Test: tentative de mise à jour avec données invalides"""
        # Création d'un équipement
        create_response = self.client.post('/api/v1/amenities/', json={
            "name": "Piscine"
        })
        amenity_id = create_response.get_json().get("id")

        # Tentative de mise à jour avec un nom vide
        update_response = self.client.put(f'/api/v1/amenities/{amenity_id}', json={
            "name": ""
        })
        self.assertEqual(update_response.status_code, 400)
        response_data = update_response.get_json()
        self.assertIn('error', response_data)
        self.assertEqual(response_data['error'], 'Invalid input data')

if __name__ == '__main__':
    unittest.main()