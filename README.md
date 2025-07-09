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
- ✅ Gestion des salles d'entraînement (approbation/rejet)
- ✅ Gestion des utilisateurs (activation/désactivation)
- ✅ Gestion des types d'exercices (CRUD complet)
- ✅ Création et gestion des badges avec règles dynamiques
- ✅ Statistiques et analytics complètes
- ✅ Dashboard administrateur avec métriques temps réel

### Propriétaire de Salle
- ✅ Enregistrement et gestion de salle de sport
- ✅ Création et gestion de défis spécifiques à sa salle
- ✅ Statistiques de la salle et des participants
- ✅ Dashboard propriétaire avec analytics

### Utilisateur Client
- ✅ Création et partage de défis d'entraînement
- ✅ Exploration et filtrage des défis par difficulté/statut
- ✅ Participation aux défis avec suivi de progression
- ✅ Enregistrement détaillé des sessions d'entraînement
- ✅ Système de badges avec attribution automatique
- ✅ Dashboard personnel avec historique et statistiques
- ✅ Suivi des calories brûlées et durées d'entraînement

## 🛠️ Stack Technique

- **Framework** : AdonisJS 6
- **Base de données** : MongoDB (driver natif)
- **Authentification** : JWT custom service
- **Validation** : VineJS
- **Tests** : Japa (46 fichiers de test)
- **Conteneurisation** : Docker & Docker Compose
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

#### Profil utilisateur
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Déconnexion
```http
POST /api/auth/logout
Authorization: Bearer <token>
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

#### Lister les salles en attente (Super Admin)
```http
GET /api/admin/gyms/pending
Authorization: Bearer <token>
```

#### Approuver une salle (Super Admin)
```http
PATCH /api/admin/gyms/:id/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "approved": true
}
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

#### Lister les défis avec filtres
```http
GET /api/challenges?page=1&limit=10&status=active&difficulty=intermediate&gymId=123
Authorization: Bearer <token>
```

#### Rejoindre un défi
```http
POST /api/challenges/:id/join
Authorization: Bearer <token>
```

#### Quitter un défi
```http
DELETE /api/challenges/:id/leave
Authorization: Bearer <token>
```

#### Obtenir les participants d'un défi
```http
GET /api/challenges/:id/participants?page=1&limit=10&status=active
Authorization: Bearer <token>
```

### Gestion des Participations

#### Lister mes participations
```http
GET /api/participations?page=1&limit=10&status=active
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

#### Modifier une session d'entraînement
```http
PUT /api/participations/:participationId/workout-sessions/:sessionId
Authorization: Bearer <token>
Content-Type: application/json

{
  "duration": 60,
  "caloriesBurned": 400,
  "notes": "Session modifiée"
}
```

#### Supprimer une session d'entraînement
```http
DELETE /api/participations/:participationId/workout-sessions/:sessionId
Authorization: Bearer <token>
```

### Dashboards et Statistiques

#### Dashboard Client
```http
GET /api/client/dashboard
Authorization: Bearer <token>
```

#### Statistiques personnelles
```http
GET /api/client/stats
Authorization: Bearer <token>
```

#### Mes défis
```http
GET /api/client/challenges
Authorization: Bearer <token>
```

#### Mes badges
```http
GET /api/client/badges
Authorization: Bearer <token>
```

#### Historique d'entraînement
```http
GET /api/client/workout-history
Authorization: Bearer <token>
```

#### Dashboard Propriétaire (Gym Owner)
```http
GET /api/owner/gym
PUT /api/owner/gym
GET /api/owner/challenges
GET /api/owner/stats
Authorization: Bearer <token>
```

### Administration (Super Admin)

#### Statistiques globales
```http
GET /api/admin/stats
Authorization: Bearer <token>
```

#### Gestion des utilisateurs
```http
GET /api/admin/users?page=1&limit=20&role=client&isActive=true
GET /api/admin/users/:id
PATCH /api/admin/users/:id/activate
DELETE /api/admin/users/:id
Authorization: Bearer <token>
```

#### Gestion des badges
```http
POST /api/admin/badges
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

```http
GET /api/admin/badges?page=1&limit=20&isActive=true
PUT /api/admin/badges/:id
DELETE /api/admin/badges/:id
Authorization: Bearer <token>
```

#### Gestion des types d'exercices
```http
POST /api/admin/exercise-types
Content-Type: application/json

{
  "name": "HIIT",
  "description": "High Intensity Interval Training",
  "targetMuscles": ["legs", "core", "arms"],
  "difficulty": "advanced"
}
```

```http
GET /api/admin/exercise-types?page=1&limit=20&difficulty=advanced
PUT /api/admin/exercise-types/:id
DELETE /api/admin/exercise-types/:id
Authorization: Bearer <token>
```

## 🧪 Tests

### Lancer tous les tests
```bash
npm test
```

### Tests par catégorie
```bash
# Tests unitaires
npm test -- --filter="unit"

# Tests d'intégration
npm test -- --filter="functional"

# Tests spécifiques
npm test -- --grep="badge"
npm test -- --grep="challenge"
```

### Couverture de tests
Le projet inclut **46 fichiers de test** couvrant :
- Tests unitaires des entités
- Tests des cas d'usage
- Tests d'intégration des contrôleurs
- Tests fonctionnels de l'API complète

## 🏗️ Structure du Projet

```
app/
├── domain/
│   ├── entities/           # Entités métier (User, Gym, Challenge, etc.)
│   ├── repositories/       # Interfaces des repositories
│   └── services/          # Interfaces des services
├── application/
│   └── use_cases/         # Cas d'usage par domaine
│       ├── user/          # Gestion utilisateurs
│       ├── gym/           # Gestion salles
│       ├── challenge/     # Gestion défis
│       └── badge/         # Gestion badges
├── infrastructure/
│   ├── database/          # Configuration MongoDB
│   ├── repositories/      # Implémentations MongoDB
│   └── services/          # Services d'infrastructure
├── controllers/           # Contrôleurs REST par domaine
├── middleware/           # Middleware d'authentification
├── helpers/              # Fonctions utilitaires
└── providers/           # Providers de dépendances

tests/
├── unit/                # Tests unitaires
└── functional/          # Tests d'intégration
```

## 🎯 Modèle de Données

### Utilisateur
```typescript
{
  id: string
  email: string
  password: string (hashé)
  role: 'super_admin' | 'gym_owner' | 'client'
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Salle de Sport
```typescript
{
  id: string
  name: string
  address: string
  contact: string
  description: string
  capacity: number
  equipment: string[]
  activities: string[]
  ownerId: string
  status: 'pending' | 'approved' | 'rejected'
  createdAt: Date
  updatedAt: Date
}
```

### Défi
```typescript
{
  id: string
  title: string
  description: string
  objectives: string[]
  exerciseTypes: string[]
  duration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  creatorId: string
  gymId?: string
  status: 'active' | 'completed' | 'cancelled'
  maxParticipants?: number
  createdAt: Date
  updatedAt: Date
}
```

### Participation au Défi
```typescript
{
  id: string
  challengeId: string
  userId: string
  status: 'active' | 'completed' | 'abandoned'
  progress: number (0-100)
  joinedAt: Date
  completedAt?: Date
  workoutSessions: WorkoutSession[]
}
```

### Session d'Entraînement
```typescript
{
  id: string
  date: Date
  duration: number
  caloriesBurned: number
  exercisesCompleted: string[]
  notes?: string
}
```

### Badge
```typescript
{
  id: string
  name: string
  description: string
  iconUrl: string
  rules: BadgeRule[]
  isActive: boolean
  createdBy: string
  createdAt: Date
  updatedAt: Date
}
```

### Règle de Badge
```typescript
{
  type: 'challenge_completion' | 'streak' | 'participation' | 'custom'
  condition: string
  value: number
}
```

### Badge Utilisateur
```typescript
{
  id: string
  userId: string
  badgeId: string
  earnedAt: Date
  metadata?: Record<string, any>
}
```

## 🔒 Sécurité

- **Authentification** : JWT token-based avec service personnalisé
- **Autorisation** : Contrôle d'accès basé sur les rôles
- **Validation** : Validation stricte des données avec VineJS
- **Hashing** : Mots de passe hashés avec AdonisJS Hash
- **Middleware** : Protection des routes avec middleware d'authentification

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
JWT_SECRET=your-secret-key-here
```

## 🚀 Fonctionnalités Avancées

### Système de Badges Dynamique
- Règles d'attribution configurables
- Évaluation automatique des badges
- Suivi des métadonnées d'attribution

### Analytics et Statistiques
- Statistiques temps réel pour tous les rôles
- Métriques de performance individuelles
- Rapports de progression mensuels
- Suivi des calories et durées d'entraînement

### Pagination et Filtrage
- Tous les endpoints de liste supportent la pagination
- Filtres avancés par statut, rôle, difficulté
- Tri et recherche intégrés

### Gestion Multi-tenant
- Séparation des données par rôle
- Dashboard personnalisé pour chaque type d'utilisateur
- Permissions granulaires

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