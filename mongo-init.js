db = db.getSiblingDB('gym_api')

db.createUser({
  user: 'api_user',
  pwd: 'api_password',
  roles: [
    {
      role: 'readWrite',
      db: 'gym_api',
    },
  ],
})

db.createCollection('users')
db.createCollection('gyms')
db.createCollection('exercise_types')
db.createCollection('challenges')
db.createCollection('challenge_participations')
db.createCollection('badges')
db.createCollection('user_badges')

db.users.createIndex({ email: 1 }, { unique: true })
db.gyms.createIndex({ ownerId: 1 })
db.gyms.createIndex({ status: 1 })
db.challenges.createIndex({ creatorId: 1 })
db.challenges.createIndex({ gymId: 1 })
db.challenges.createIndex({ status: 1 })
db.challenge_participations.createIndex({ userId: 1 })
db.challenge_participations.createIndex({ challengeId: 1 })
db.challenge_participations.createIndex({ userId: 1, challengeId: 1 }, { unique: true })
db.user_badges.createIndex({ userId: 1 })
db.user_badges.createIndex({ badgeId: 1 })
db.user_badges.createIndex({ userId: 1, badgeId: 1 }, { unique: true })
