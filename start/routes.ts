/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router.get('/', async () => {
  return {
    hello: 'Gym API',
    version: '1.0.0',
    features: [
      'User Management',
      'Gym Management',
      'Challenge System',
      'Badge System',
      'Exercise Types',
      'Workout Tracking',
    ],
  }
})

// Routes d'authentification (publiques)
router
  .group(() => {
    router.post('/register', '#controllers/auth_controller.register')
    router.post('/login', '#controllers/auth_controller.login')
  })
  .prefix('/api/auth')

// Routes d'authentification (protégées)
router
  .group(() => {
    router.post('/logout', '#controllers/auth_controller.logout')
    router.get('/me', '#controllers/auth_controller.me')
  })
  .prefix('/api/auth')

// Routes pour les gyms
router
  .group(() => {
    router.get('/gyms', '#controllers/gyms_controller.index')
    router.get('/gyms/:id', '#controllers/gyms_controller.show')
    router.post('/gyms', '#controllers/gyms_controller.create')
    router.put('/gyms/:id', '#controllers/gyms_controller.update')
  })
  .prefix('/api')

// Routes pour les challenges
router
  .group(() => {
    router.get('/challenges', '#controllers/challenges_controller.index')
    router.get('/challenges/:id', '#controllers/challenges_controller.show')
    router.post('/challenges', '#controllers/challenges_controller.create')
    router.put('/challenges/:id', '#controllers/challenges_controller.update')
    router.delete('/challenges/:id', '#controllers/challenges_controller.delete')
    router.post('/challenges/:id/join', '#controllers/challenges_controller.join')
    router.delete('/challenges/:id/leave', '#controllers/challenges_controller.leave')
    router.get('/challenges/:id/participants', '#controllers/challenges_controller.participants')
  })
  .prefix('/api')

// Routes pour les participations et séances d'entraînement
router.get('/api/participations', '#controllers/participations_controller.index')
router.get('/api/participations/:id', '#controllers/participations_controller.show')
router.post(
  '/api/participations/:id/workout-sessions',
  '#controllers/participations_controller.addWorkoutSession'
)
router.get(
  '/api/participations/:id/workout-sessions',
  '#controllers/participations_controller.getWorkoutSessions'
)
router.put(
  '/api/participations/:id/workout-sessions/:sessionId',
  '#controllers/participations_controller.updateWorkoutSession'
)
router.delete(
  '/api/participations/:id/workout-sessions/:sessionId',
  '#controllers/participations_controller.deleteWorkoutSession'
)

// Routes pour les badges
router
  .group(() => {
    router.get('/badges', '#controllers/badges_controller.index')
    router.get('/badges/:id', '#controllers/badges_controller.show')
    router.get('/my-badges', '#controllers/badges_controller.myBadges')
  })
  .prefix('/api')

// Routes pour les types d'exercices
router
  .group(() => {
    router.get('/exercise-types', '#controllers/exercise_types_controller.index')
    router.get('/exercise-types/:id', '#controllers/exercise_types_controller.show')
  })
  .prefix('/api')

// Routes d'administration (super admin uniquement)
router
  .group(() => {
    router.get('/admin/users', '#controllers/admin_controller.listUsers')
    router.get('/admin/users/:id', '#controllers/admin_controller.showUser')
    router.delete('/admin/users/:id', '#controllers/admin_controller.deactivateUser')
    router.patch('/admin/users/:id/activate', '#controllers/admin_controller.activateUser')

    router.get('/admin/gyms/pending', '#controllers/admin_controller.pendingGyms')
    router.patch('/admin/gyms/:id/approve', '#controllers/admin_controller.approveGym')

    router.post('/admin/badges', '#controllers/admin_controller.createBadge')
    router.get('/admin/badges', '#controllers/admin_controller.listBadges')
    router.put('/admin/badges/:id', '#controllers/admin_controller.updateBadge')
    router.delete('/admin/badges/:id', '#controllers/admin_controller.deleteBadge')

    router.post('/admin/exercise-types', '#controllers/admin_controller.createExerciseType')
    router.get('/admin/exercise-types', '#controllers/admin_controller.listExerciseTypes')
    router.put('/admin/exercise-types/:id', '#controllers/admin_controller.updateExerciseType')
    router.delete('/admin/exercise-types/:id', '#controllers/admin_controller.deleteExerciseType')

    router.get('/admin/stats', '#controllers/admin_controller.getStats')
  })
  .prefix('/api')

// Routes pour les propriétaires de gym
router
  .group(() => {
    router.get('/owner/gym', '#controllers/gym_owner_controller.myGym')
    router.put('/owner/gym', '#controllers/gym_owner_controller.updateMyGym')
    router.get('/owner/challenges', '#controllers/gym_owner_controller.myGymChallenges')
    router.get('/owner/stats', '#controllers/gym_owner_controller.getStats')
  })
  .prefix('/api')

// Routes pour les clients
router
  .group(() => {
    router.get('/client/dashboard', '#controllers/client_controller.dashboard')
    router.get('/client/challenges', '#controllers/client_controller.myChallenges')
    router.get('/client/badges', '#controllers/client_controller.myBadges')
    router.get('/client/stats', '#controllers/client_controller.getStats')
    router.get('/client/workout-history', '#controllers/client_controller.workoutHistory')
  })
  .prefix('/api')
