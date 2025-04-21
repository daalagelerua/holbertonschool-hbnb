# Résultats Test Manuels - API HBnB
## Test 1 : Création d'un utilisateur valide
### Description:
Vérification création utilisateur via une requête POST avec les informations nécessaires.
### Requête CURL:
```bash
curl -X POST http://127.0.0.1:5000/api/v1/users/ \
  -H "Content-Type: application/json" \
  -d '{"first_name": "Al", "last_name": "Tyt", "email": "alx@gmail.com"}'
```
### Résultat
```json
{
    "id": "c267695e-9741-4a79-ac03-00f423a5724e",
    "first_name": "al",
    "last_name": "tyt",
    "email": "al@gmail.com"
}
// 201 CREATED
```
## Test 2 : Création d'un utilisateur information non valide
### Description:
Vérification impossibilité de création utilisateur via une requête POST si information non valide.
### Requête CURL:
**Requête 2.1** contenant first_name invalide 
```bash
curl -X POST http://127.0.0.1:5000/api/v1/users/ \
  -H "Content-Type: application/json" \
  -d '{"first_name": "", "last_name": "Tyt", "email": "alx@gmail.com"}'
```
### Résultat
```json
{
  "error": "Invalid Input data"
}
// 400 BAD REQUEST
```
### Requête CURL:
**Requête 2.2** contenant last_name invalide 
```bash
curl -X POST http://127.0.0.1:5000/api/v1/users/ \
  -H "Content-Type: application/json" \
  -d '{"first_name": "Al", "last_name": "", "email": "alxd@gmail.com"}'
```
### Résultat
```json
{
  "error": "Invalid Input data"
}
```
### Requête CURL:
**Requête 2.3** contenant un mail invalide
```bash
curl -X POST http://127.0.0.1:5000/api/v1/users/ \
  -H "Content-Type: application/json" \
  -d '{"first_name": "jm", "last_name": "lm", "email": "algmail.com"}'
```
### Résultat
```json
{
    "error": "Invalid Input data"
}
// 400 BAD REQUEST
```
### Requête CURL:
**Requête 2.4** Contenant un mail déjà existant
```bash
curl -X POST http://127.0.0.1:5000/api/v1/users/ \
  -H "Content-Type: application/json" \
  -d '{"first_name": "Al", "last_name": "Plp", "email": "al@gmail.com"}'
```
### Résultat
```json
{
    "error": "Email already registered"
}
// 400 BAD REQUEST
```
## Test 3 : Récupération liste utilisateur
### Description:
Vérification récupération liste utilisateur via une requête GET.
### Requête CURL:
```bash
curl GET 'http://127.0.0.1:5000/api/v1/users/'
```
### Résultat
```json
[
    {
      "id": "c267695e-9741-4a79-ac03-00f423a5724e",
      "first_name": "Al",
      "last_name": "Tyt",
      "email": "al@gmail.com"
    }
]
// 200 OK
```
## Test 4 : Récupération d'un utilisateur par son id
### Description:
Vérification récupération d'un utilisateur par son id via une requête GET.
### Requête CURL:
```bash
curl GET 'http://127.0.0.1:5000/api/v1/users/ec267695e-9741-4a79-ac03-00f423a5724e'
```
### Résultat
```json
{
    "id": "c267695e-9741-4a79-ac03-00f423a5724e",
    "first_name": "Al",
    "last_name": "Tyt",
    "email": "al@gmail.com"
}
// 200 OK
```
## Test 5 : Récupération d'un utilisateur par un id invalide
### Description:
Vérification récupération d'un utilisateur par un id invalide via une requête GE sois impossible.
### Requête CURL:
```bash
curl GET 'http://127.0.0.1:5000/api/v1/users/eb289057-f7c6-4d41-982a-1c7617415c90'
```
### Résultat
```json
{
  "error": "User not found"
}
// 404 NOT FOUND
```
## Test 6 : Modification information d'un utilisateur
### Description:
Vérification modification information d'un utilisateur via une requête PUT.
### Requête CURL:
```bash
curl -X PUT 'http://127.0.0.1:5000/api/v1/users/c267695e-9741-4a79-ac03-00f423a5724e' \
  -H "Content-Type: application/json" \
  -d '{"first_name": "alx", "last_name": "tyt", "email": "al@gmail.com"}'
```
### Résultat
```json
{
  "id": "c267695e-9741-4a79-ac03-00f423a5724e",
  "first_name": "alx",
  "last_name": "tyt",
  "email": "al@gmail.com"
}
// 200 OK
```
## Test 7 : Modification information d'un utilisateur avec adresse email existante
### Description:
Vérification modification information d'un utilisateur par une adresse mail existante via une requête PUT sois impossible.
### Requête CURL:
```bash
curl -X PUT 'http://127.0.0.1:5000/api/v1/users/e983436d-2f34-4201-872f-f0d91d833016' \
  -H "Content-Type: application/json" \
  -d '{"first_name": "alx", "last_name": "tyt", "email": "jp@gmail.com"}'
```
### Résultat
```json
{
  "error": "Email already registered"
}
// 400 BAD REQUEST
```