# Résultats Test Manuels - API HBnB
## Test 1 : Création d'une amenity valide
### Description:
Vérification création amenity via une requête POST avec les informations nécessaires.
### Requête CURL:
```bash
curl -X POST "http://127.0.0.1:5000/api/v1/amenities/" \
-H "Content-Type: application/json" \
-d '{"name": "piscine"}'
```
### Résultat
```json
{
    "id": "aca70c74-6114-48ca-afc7-73caac9d42c2",
    "name": "piscine"
}
// 201 CREATED
```
## Test 2 : Récupération liste amenity
### Description:
Vérification récupération liste amenity via une requête GET.
### Requête CURL:
```bash
curl GET 'http://127.0.0.1:5000/api/v1/amenities/aca70c74-6114-48ca-afc7-73caac9d42c2'
```
### Résultat
```json
[
    {
        "id": "aca70c74-6114-48ca-afc7-73caac9d42c2",
        "name": "piscine"
    },
    {
        "id": "f40c67e6-d4ce-42a0-8ea7-4eb105187c88",
        "name": "sauna"
    }
]
// 200 OK
```
## Test 3 : Récupération amenity par son id
### Description:
Vérification récupération amenity par son id via une requête GET.
### Requête CURL:
```bash
curl GET 'http://127.0.0.1:5000/api/v1/amenities/aca70c74-6114-48ca-afc7-73caac9d42c2'
```
### Résultat
```json
{
    "id": "f40c67e6-d4ce-42a0-8ea7-4eb105187c88",
    "name": "piscine"
}
// 200 OK
```
## Test 3 : Récupération amenity par id invalide
### Description:
Vérification récupération amenity par son id via une requête GET sois impossible.
### Requête CURL:
```bash
curl GET 'http://127.0.0.1:5000/api/v1/amenities/f40c67e6-d4ce-42a0-8ea7-4eb10187c88'
```
### Résultat
```json
{
    "error": "Amenity not found"
}
// 404 NOT FOUND
```
## Test 4 : Modification d'une amenity
### Description:
Vérification modification amenity via une requête PUT.
### Requête CURL:
```bash
curl -X PUT "http://127.0.0.1:5000/api/v1/amenities/aca70c74-6114-48ca-afc7-73caac9d42c2" \
-H "Content-Type: application/json" \
-d '{"name": "sauna"}'
```
### Résultat
```json
{
    "id": "aca70c74-6114-48ca-afc7-73caac9d42c2",
    "name": "sauna"
}
// 201 CREATED
```