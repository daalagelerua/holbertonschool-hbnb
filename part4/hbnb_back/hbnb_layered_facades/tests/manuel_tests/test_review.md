# Résultats Test Manuels - API HBnB
## Test 1 : Création d'une review valide
### Description:
Vérification création review via une requête POST avec les informations nécessaires.
### Requête CURL:
```bash
curl -X 'POST' \
  'http://127.0.0.1:5000/api/v1/reviews/' \
  -H 'Content-Type: application/json' \
  -d '{"text": "string", "rating": 0, "user_id": "9b4cf0d6-25bb-42b5-a0c2-662d14121d9a","place_id": "205b1922-2f9f-491d-9fc3-5d870a85931d"}'

```
### Résultat
```json
{
  "id": "56625d91-be8f-4768-8653-52965f445a0c",
  "text": "string",
  "rating": 0,
  "user_id": "9b4cf0d6-25bb-42b5-a0c2-662d14121d9a",
  "place_id": "205b1922-2f9f-491d-9fc3-5d870a85931d"
}
// 201 CREATED
```
## Test 2 : Récupération review
### Description:
Vérification récupération review via une requête GET.
### Requête CURL:
```bash
curl -X 'GET' \
  'http://127.0.0.1:5000/api/v1/reviews/' \
  -H 'accept: application/json'
```
### Résultat
```json
[
  {
    "id": "144c53ef-4f84-49b0-8891-d9944eb3de04",
    "text": "string",
    "rating": 0
  }
]
// 200 OK
```
## Test 3 : Récupération review par son id
### Description:
Vérification récupération review par son id via une requête GET.
### Requête CURL:
```bash
curl -X 'GET' \
  'http://127.0.0.1:5000/api/v1/reviews/205b1922-2f9f-491d-9fc3-5d870a85931d' \
  -H 'accept: application/json'
```
### Résultat
```json
[
  {
    "id": "144c53ef-4f84-49b0-8891-d9944eb3de04",
    "text": "string",
    "rating": 0
  }
]
// 200 OK
```
## Test 4 : Modification review
### Description:
Vérification modification review  via une requête PUT.
### Requête CURL:
```bash
curl -X 'PUT' \
  'http://127.0.0.1:5000/api/v1/reviews/144c53ef-4f84-49b0-8891-d9944eb3de04' \
  -H 'Content-Type: application/json' \
  -d '{"text": "str", "rating": 0, "user_id": "string", "place_id": "string"}'
```
### Résultat
```json
[
  {
  "message": "Review updated successfully"
  }
]
// 200 OK
```
## Test 5 : Suppression review
### Description:
Vérification suppression review  via une requête DELETE.
### Requête CURL:
```bash
curl -X 'DELETE' \
  'http://127.0.0.1:5000/api/v1/reviews/144c53ef-4f84-49b0-8891-d9944eb3de04' \
  -H 'accept: application/json'

```
### Résultat
```json
[
  {
  "message": "Review deleted successfully"
  }
]
// 200 OK
```