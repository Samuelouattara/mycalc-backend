# Documentation Swagger - MyCalc API

## Vue d'ensemble

Cette API de calculatrice permet d'effectuer des calculs mathématiques avec gestion des utilisateurs et historique des calculs.

## Accès à la documentation

Une fois l'application démarrée, la documentation Swagger est accessible à l'adresse :
```
http://localhost:3007/api
```

## Endpoints disponibles

### 1. Endpoints de calculs (`/calculations`)

#### POST `/calculations/compute`
Effectue un calcul simple avec deux nombres et un opérateur.

**Paramètres :**
- `expression1` (number) : Premier nombre
- `operator` (string) : Opérateur (+, -, *, /, sin, cos, tan)
- `expression2` (number, optionnel) : Deuxième nombre (non requis pour les fonctions trigonométriques)
- `userId` (number, optionnel) : ID de l'utilisateur

**Exemple :**
```json
{
  "expression1": 10,
  "operator": "+",
  "expression2": 5,
  "userId": 1
}
```

#### POST `/calculations/chain`
Effectue un calcul en chaîne avec une expression mathématique complète.

**Paramètres :**
- `expression` (string) : Expression mathématique complète
- `userId` (number, optionnel) : ID de l'utilisateur

**Exemple :**
```json
{
  "expression": "2 + 3 * 4",
  "userId": 1
}
```

#### GET `/calculations/history/:userId`
Récupère l'historique paginé des calculs d'un utilisateur.

**Paramètres :**
- `userId` (path) : ID de l'utilisateur
- `page` (query, optionnel) : Numéro de page (défaut: 1)

#### POST `/calculations/:userId`
Crée un calcul pour un utilisateur spécifique.

**Paramètres :**
- `userId` (path) : ID de l'utilisateur
- `expression` (string) : Expression mathématique
- `result` (string) : Résultat du calcul

#### GET `/calculations/:userId`
Récupère tous les calculs d'un utilisateur.

**Paramètres :**
- `userId` (path) : ID de l'utilisateur

### 2. Endpoints d'utilisateurs (`/users`)

#### POST `/users/register`
Inscrit un nouvel utilisateur.

**Paramètres :**
- `email` (string) : Adresse email
- `password` (string) : Mot de passe
- `Nom` (string) : Nom de l'utilisateur
- `icon` (number, optionnel) : Icône de l'utilisateur

#### POST `/users/login`
Connecte un utilisateur.

**Paramètres :**
- `email` (string) : Adresse email
- `password` (string) : Mot de passe

#### GET `/users`
Récupère tous les utilisateurs.

#### GET `/users/:id`
Récupère un utilisateur par son ID.

**Paramètres :**
- `id` (path) : ID de l'utilisateur

#### DELETE `/users`
Supprime tous les utilisateurs.

### 3. Endpoints généraux

#### GET `/`
Endpoint de test retournant un message de bienvenue.

## Fonctionnalités de la documentation Swagger

1. **Interface interactive** : Testez directement les endpoints depuis l'interface web
2. **Exemples de requêtes** : Chaque endpoint inclut des exemples de données
3. **Validation des schémas** : Les données sont validées selon les DTOs définis
4. **Codes de réponse** : Documentation complète des codes de statut HTTP
5. **Tri alphabétique** : Les endpoints et opérations sont triés alphabétiquement

## Démarrage de l'application

```bash
# Installation des dépendances
npm install

# Démarrage en mode développement
npm run start:dev

# Ou démarrage en mode production
npm run start:prod
```

## Validation des données

L'API utilise `class-validator` pour valider automatiquement les données entrantes :
- Validation des types de données
- Validation des emails
- Validation des champs requis/optionnels
- Rejet des propriétés non autorisées

## Base de données

L'application utilise SQLite comme base de données avec TypeORM pour la gestion des entités :
- **User** : Gestion des utilisateurs
- **Calculation** : Historique des calculs avec relation vers l'utilisateur
