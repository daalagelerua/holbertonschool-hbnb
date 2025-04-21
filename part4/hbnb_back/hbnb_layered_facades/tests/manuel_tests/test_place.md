# Résultats Test Manuels - API HBnB
## Test 1 : Création d'une place valide
### Description:
Vérification création place via une requête POST avec les informations nécessaires.
### Requête CURL:
```bash
curl -X POST "http://127.0.0.1:5000/api/v1/places/" \
-H "Content-Type: application/json" \
-d '{"title": "Titre de la place", "description": "Description de la place", "price": 100.0, "latitude": 40.7128, "longitude": -74.0060, "owner_id": "c267695e-9741-4a79-ac03-00f423a5724e"}'
```
### Résultat
```json
    "id": "4d268853-c687-43a6-b6e0-d2812741d236",
    "title": "Titre de la place",
    "description": "Description de la place",
    "price": 100.0,
    "latitude": 40.7128,
    "longitude": -74.006,
    "owner_id": "c267695e-9741-4a79-ac03-00f423a5724e"
// 201 CREATED
```
## Test 2 : Création d'une place information non valide
### Description:
Vérification création place via une requête POST avec inforamtions invalide sois impossible.
### Requête CURL:
**Requête 2.1** : Contenant un prix négatif
```bash
curl -X POST "http://127.0.0.1:5000/api/v1/places/" \
-H "Content-Type: application/json" \
-d '{"title": "Titre de la place", "description": "Description de la place", "price": -100.0, "latitude": 40.7128, "longitude": -74.0060, "owner_id": "c267695e-9741-4a79-ac03-00f423a5724e"}'
```
### Résultat
```json
    "error": "Invalid input data"
// 400 BAD REQUEST
```
**Requête 2.2** : Contenant une latitude incorrecte
```bash
curl -X POST "http://127.0.0.1:5000/api/v1/places/" \
-H "Content-Type: application/json" \
-d '{"title": "Titre de la place", "description": "Description de la place", "price": 100.0, "latitude": 91.0000, "longitude": -74.0060, "owner_id": "c267695e-9741-4a79-ac03-00f423a5724e"}'
```
### Résultat
```json
    "error": "Invalid input data"
// 400 BAD REQUEST
```
**Requête 2.3** : Contenant une longitude incorrecte
```bash
curl -X POST "http://127.0.0.1:5000/api/v1/places/" \
-H "Content-Type: application/json" \
-d '{"title": "Titre de la place", "description": "Description de la place", "price": 100.0, "latitude": 89.1200, "longitude": -182.0304, "owner_id": "c267695e-9741-4a79-ac03-00f423a5724e"}'
```
### Résultat
```json
    "error": "Invalid input data"
// 400 BAD REQUEST
```
**Requête 2.4** : Contenant un id owner incorrecte
```bash
curl -X POST "http://127.0.0.1:5000/api/v1/places/" \
-H "Content-Type: application/json" \
-d '{"title": "Titre de la place", "description": "Description de la place", "price": 100.0, "latitude": 89.1200, "longitude": -71.0987, "owner_id": "c267695e-9741-4a79-ac03-00f423a5724e"}'
```
### Résultat
```json
    "error": "Owner not found"
// 404 NOT FOUND
```
## Test 3 : Récupération liste place
### Description:
Vérification récupération place via une requête GET.
### Requête CURL:
```bash
curl GET 'http://127.0.0.1:5000/api/v1/places/'
```
### Résultat
```json
[
    {
        "title": "Titre de la place",
        "description": "Description de la place",
        "price": 100.0,
        "latitude": 40.7128,
        "longitude": -74.006,
        "owner_id": "c267695e-9741-4a79-ac03-00f423a5724e"
    }
]
// 20O OK
```