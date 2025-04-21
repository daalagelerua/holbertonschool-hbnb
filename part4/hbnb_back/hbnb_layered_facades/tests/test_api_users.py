import unittest
from app import create_app

class TestUserEndpoints(unittest.TestCase):
    """Tests des endpoints API utilisateur"""

    def setUp(self):
        """Initialisation du client de test"""
        self.app = create_app()  # Instancie l'application Flask
        self.client = self.app.test_client()

    def test_create_user(self):
        """Test: création d'un utilisateur avec données valides"""
        create_response = self.client.post('/api/v1/users/', json={
            "first_name": "Jane",
            "last_name": "Doe",
            "email": "jane.doe@gmail.com"
        })
        self.assertEqual(create_response.status_code, 201)

         # Vérifie que la réponse est bien en JSON et contient un ID
        response_data = create_response.get_json()
        self.assertIsNotNone(response_data)  # Vérifie que réponse pas None
        user_id = response_data.get("id")
        self.assertIsNotNone(user_id)  # Vérifie que l'ID est bien présent

    def test_create_user_invalid_data(self):
        """Test: tentative de création avec données invalides"""
        response = self.client.post('/api/v1/users/', json={
            "first_name": "",
            "last_name": "",
            "email": "invalid-email"
        })
        self.assertEqual(response.status_code, 400)
        response_data = response.get_json()
        self.assertIn('error', response_data)
        self.assertEqual(response_data['error'], 'Invalid input data')
  
    def test_create_user_already_registered(self):
        """Test: tentative de création avec mail déjà enregistré"""
        response = self.client.post('/api/v1/users/', json={
            "first_name": "Jane",
            "last_name": "Doe-Clark",
            "email": "jane.doe@gmail.com"
        })
        self.assertEqual(response.status_code, 400)
        response_data = response.get_json()
        self.assertIn('error', response_data)
        self.assertEqual(response_data['error'], 'Email already registered')

    def test_get_user(self):
        """Test: récupérer un utilisateur existant"""
        # créer un utilisateur pour le test
        create_response = self.client.post('/api/v1/users/', json={
            "first_name": "John",
            "last_name": "Doe",
            "email": "john.doe@gmail.com"
        })
        user_id = create_response.get_json().get("id")

        # Récupération de l'utilisateur
        get_response = self.client.get(f'/api/v1/users/{user_id}')
        self.assertEqual(get_response.status_code, 200)

        data = get_response.get_json()
        self.assertEqual(data["email"], "john.doe@gmail.com")

    def test_get_nonexistent_user(self):
        """Test: récupérer un utilisateur inexistant"""
        response = self.client.get('/api/v1/users/99999')
        self.assertEqual(response.status_code, 404)
        response_data = response.get_json()
        self.assertIn('error', response_data)
        self.assertEqual(response_data['error'], 'User not found')

    def test_get_all_users(self):
        """Test: obtenir la liste de tous les utilisateurs"""
        response = self.client.get('/api/v1/users/')
        self.assertEqual(response.status_code, 200)
        users = response.get_json()
        self.assertIsInstance(users, list)  # Vérifie que réponse est une liste
        if users:  # Vérifie que si utilisateurs existent, ont les bons champs
            for user in users:
                self.assertIn('first_name', user)
                self.assertIn('last_name', user)
                self.assertIn('email', user)

    def test_update_user(self):
        """Test: mise à jour d'un utilisateur"""
        # Création d'un utilisateur
        create_response = self.client.post('/api/v1/users/', json={
            "first_name": "John",
            "last_name": "Average",
            "email": "john.average@gmail.com"
        })
        user_data = create_response.get_json()
        user_id = user_data.get("id")

        # Mise à jour de l'utilisateur
        update_response = self.client.put(f'/api/v1/users/{user_id}', json={
            "first_name": "Johnny",
            "last_name": "Average",
            "email": "johnny.average@gmail.com"
        })
        self.assertEqual(update_response.status_code, 200)

        updated_data = update_response.get_json()
        self.assertEqual(updated_data["first_name"], "Johnny")
        self.assertEqual(updated_data["email"], "johnny.average@gmail.com")

    def test_update_nonexistent_user(self):
        """Test: mise à jour d'un utilisateur inexistant"""
        response = self.client.put('/api/v1/users/99999', json={
            "first_name": "Jonathan",
            "last_name": "Doan",
            "email": "jonathan.doan@gmail.com"
        })
        self.assertEqual(response.status_code, 404)
        response_data = response.get_json()
        self.assertIn('error', response_data)
        self.assertEqual(response_data['error'], 'User not found')

    def test_update_user_invalid_data(self):
        """Test: tentative de mise à jour avec données invalides"""
        # Création d'un utilisateur
        create_response = self.client.post('/api/v1/users/', json={
            "first_name": "Joe",
            "last_name": "Average",
            "email": "joe.average@gmail.com"
        })
        user_id = create_response.get_json().get("id")

        # Tentative de mise à jour avec un email invalide
        update_response = self.client.put(f'/api/v1/users/{user_id}', json={
            "first_name": "",
            "last_name": "Avery",
            "email": "invalid-email"
        })
        self.assertEqual(update_response.status_code, 400)
        response_data = update_response.get_json()
        self.assertIn('error', response_data)
        self.assertEqual(response_data['error'], 'Invalid input data')

    def test_update_user_already_registered(self):
        """Test: tentative de mise à jour avec un mail enregistré"""
        # Création d'un utilisateur
        create_response = self.client.post('/api/v1/users/', json={
            "first_name": "James",
            "last_name": "Pond",
            "email": "james.pond@gmail.com"
        })
        user_id = create_response.get_json().get("id")
        update_response = self.client.put(f'/api/v1/users/{user_id}', json={
            "first_name": "James",
            "last_name": "Bond",
            "email": "john.doe@gmail.com"
        })
        self.assertEqual(update_response.status_code, 400)
        response_data = update_response.get_json()
        self.assertIn('error', response_data)
        self.assertEqual(response_data['error'], 'Email already registered')

if __name__ == '__main__':
    unittest.main()