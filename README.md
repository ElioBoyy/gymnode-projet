# Gym API - Système de Gestion de Salles d'Entraînement

Une API RESTful complète pour la gestion de salles d'entraînement avec défis, badges et suivi de progression, implémentée avec une architecture clean et les principes SOLID.

## 🏗️ Architecture

Cette API suit les principes de **Clean Architecture** et **SOLID** :

- **Domain Layer** : Entités métier et règles de gestion
- **Application Layer** : Cas d'usage et logique applicative
- **Infrastructure Layer** : Repositories MongoDB, services externes
- **Presentation Layer** : Contrôleurs REST

## 🚀 Fonctionnalités

### Super Admin

- ✅ Gestion des salles d'entraînement (création, modification, suppression, approbation)
- ✅ Gestion des types d'exercices
- ✅ Création de badges et récompenses avec règles dynamiques
- ✅ Gestion des utilisateurs (désactivation, suppression)

### Propriétaire de Salle

- ✅ Enregistrement de salle de sport avec validation
- ✅ Proposition de défis spécifiques à sa salle
- ✅ Gestion des informations de la salle

### Utilisateur Client

- ✅ Création et partage de défis d'entraînement
- ✅ Exploration et filtrage des défis
- ✅ Suivi de l'entraînement avec sessions de workout
- ✅ Défis sociaux et collaboration
- ✅ Système de récompenses et badges
- ✅ Classements des utilisateurs

## 🛠️ Stack Technique

- **Framework** : AdonisJS 6
- **Base de données** : MongoDB
- **Conteneurisation** : Docker & Docker Compose
- **Tests** : Japa (unitaires et intégration)
- **Validation** : VineJS
- **Architecture** : Clean Architecture + SOLID

## 📋 Prérequis

- Node.js 18+
- Docker et Docker Compose
- MongoDB (via Docker)

## 🚀 Installation et Démarrage

### 1. Cloner le projet

```bash
git clone <repository-url>
cd gym-api
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Démarrer avec Docker

```bash
# Démarrer MongoDB et l'application
docker-compose up -d

# Ou juste MongoDB
docker-compose up mongodb -d
```

### 4. Démarrage en développement

```bash
# Variables d'environnement
cp .env.example .env

# Démarrer l'application
npm run dev
```

L'API sera disponible sur `http://localhost:3333`

## 📚 Documentation API

### Authentification

#### Inscription

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "role": "client" | "gym_owner" | "super_admin"
}
```

#### Connexion

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Gestion des Salles

#### Créer une salle (Gym Owner)

```http
POST /api/gyms
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Ma Salle de Sport",
  "address": "123 Rue Example",
  "contact": "contact@gym.com",
  "description": "Une excellente salle de sport",
  "capacity": 100,
  "equipment": ["treadmill", "weights", "yoga_mats"],
  "activities": ["cardio", "strength", "yoga"]
}
```

#### Approuver une salle (Super Admin)

```http
PATCH /api/gyms/:id/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "approved": true
}
```

#### Lister les salles en attente (Super Admin)

```http
GET /api/gyms/pending
Authorization: Bearer <token>
```

### Gestion des Défis

#### Créer un défi

```http
POST /api/challenges
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Défi 30 jours Cardio",
  "description": "Un défi intense de cardio sur 30 jours",
  "objectives": ["Faire 30 min de cardio par jour", "Brûler 300 calories minimum"],
  "exerciseTypes": ["cardio", "running"],
  "duration": 30,
  "difficulty": "intermediate",
  "gymId": "optional-gym-id",
  "maxParticipants": 50
}
```

#### Rejoindre un défi

```http
POST /api/challenges/:id/join
Authorization: Bearer <token>
```

#### Ajouter une session d'entraînement

```http
POST /api/participations/:participationId/workout-sessions
Authorization: Bearer <token>
Content-Type: application/json

{
  "duration": 45,
  "caloriesBurned": 350,
  "exercisesCompleted": ["running", "cycling"],
  "notes": "Excellente session aujourd'hui!"
}
```

### Administration

#### Désactiver un utilisateur (Super Admin)

```http
DELETE /api/users/:id
Authorization: Bearer <token>
```

#### Créer un badge (Super Admin)

```http
POST /api/badges
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Champion Cardio",
  "description": "Accordé pour 10 défis cardio complétés",
  "iconUrl": "https://example.com/badge-icon.png",
  "rules": [
    {
      "type": "challenge_completion",
      "condition": "cardio_challenges",
      "value": 10
    }
  ]
}
```

#### Créer un type d'exercice (Super Admin)

```http
POST /api/exercise-types
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "HIIT",
  "description": "High Intensity Interval Training",
  "targetMuscles": ["legs", "core", "arms"],
  "difficulty": "advanced"
}
```

## 🧪 Tests

### Lancer tous les tests

```bash
npm test
```

### Tests unitaires seulement

```bash
npm run test -- --filter="unit"
```

### Tests d'intégration seulement

```bash
npm run test -- --filter="functional"
```

## 🏗️ Structure du Projet

```
app/
├── domain/
│   ├── entities/           # Entités métier
│   ├── repositories/       # Interfaces des repositories
│   └── services/          # Interfaces des services
├── application/
│   └── use-cases/         # Cas d'usage métier
├── infrastructure/
│   ├── database/          # Configuration MongoDB
│   ├── repositories/      # Implémentation MongoDB
│   └── services/          # Services d'infrastructure
├── controllers/           # Contrôleurs REST
├── middleware/           # Middleware d'authentification
└── providers/           # Providers de dépendances

tests/
├── unit/                # Tests unitaires
└── functional/          # Tests d'intégration
```

## 🎯 Modèle de Données

### Utilisateur

- **id** : Identifiant unique
- **email** : Email unique
- **password** : Mot de passe hashé
- **role** : super_admin | gym_owner | client
- **isActive** : Statut actif/inactif

### Salle de Sport

- **id** : Identifiant unique
- **name** : Nom de la salle
- **address** : Adresse complète
- **contact** : Informations de contact
- **description** : Description des installations
- **capacity** : Capacité d'accueil
- **equipment** : Liste des équipements
- **activities** : Types d'activités proposées
- **ownerId** : Référence au propriétaire
- **status** : pending | approved | rejected

### Défi

- **id** : Identifiant unique
- **title** : Titre du défi
- **description** : Description détaillée
- **objectives** : Liste des objectifs
- **exerciseTypes** : Types d'exercices impliqués
- **duration** : Durée en jours
- **difficulty** : beginner | intermediate | advanced
- **creatorId** : Créateur du défi
- **gymId** : Salle associée (optionnel)
- **status** : active | completed | cancelled

### Participation au Défi

- **id** : Identifiant unique
- **challengeId** : Référence au défi
- **userId** : Référence à l'utilisateur
- **status** : active | completed | abandoned
- **progress** : Pourcentage de progression (0-100)
- **workoutSessions** : Sessions d'entraînement enregistrées

### Badge

- **id** : Identifiant unique
- **name** : Nom du badge
- **description** : Description du badge
- **iconUrl** : URL de l'icône
- **rules** : Règles d'attribution dynamiques
- **isActive** : Statut actif/inactif

## 🔒 Sécurité

- **Authentification** : Token-based (middleware personnalisé)
- **Autorisation** : Contrôle d'accès basé sur les rôles
- **Validation** : Validation stricte des données avec VineJS
- **Hashing** : Mots de passe hashés avec AdonisJS Hash

## 🐳 Docker

Le projet inclut une configuration Docker complète :

- **MongoDB** : Base de données avec initialisation automatique
- **Application** : Service Node.js avec hot-reload
- **Volumes** : Persistance des données MongoDB
- **Network** : Communication entre services

## 📝 Variables d'Environnement

```env
NODE_ENV=development
MONGODB_URI=mongodb://admin:password@localhost:27017/gym_api?authSource=admin
```

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/nouvelle-fonctionnalite`)
3. Commit les changements (`git commit -am 'Ajouter nouvelle fonctionnalité'`)
4. Push vers la branche (`git push origin feature/nouvelle-fonctionnalite`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT.

---

**Développé avec une architecture Clean et les principes SOLID pour une maintenabilité et extensibilité maximales.**
