import { test } from '@japa/runner'
import { Challenge, ChallengeStatus } from '../../../app/domain/entities/challenge.js'

test.group('Challenge Entity', (group) => {
  test('should create a challenge with correct properties', ({ assert }) => {
    const challengeData = {
      id: '12345',
      title: 'Test Challenge',
      description: 'A test challenge',
      objectives: ['Complete 10 workouts'],
      exerciseTypes: ['cardio', 'strength'],
      duration: 30,
      difficulty: 'beginner' as const,
      creatorId: 'creator123',
    }

    const challenge = new Challenge(challengeData)

    assert.equal(challenge.id, challengeData.id)
    assert.equal(challenge.title, challengeData.title)
    assert.equal(challenge.description, challengeData.description)
    assert.deepEqual(challenge.objectives, challengeData.objectives)
    assert.deepEqual(challenge.exerciseTypes, challengeData.exerciseTypes)
    assert.equal(challenge.duration, challengeData.duration)
    assert.equal(challenge.difficulty, challengeData.difficulty)
    assert.equal(challenge.creatorId, challengeData.creatorId)
    assert.equal(challenge.status, ChallengeStatus.ACTIVE)
    assert.instanceOf(challenge.createdAt, Date)
    assert.instanceOf(challenge.updatedAt, Date)
  })

  test('should complete challenge', ({ assert }) => {
    const challenge = new Challenge({
      id: '12345',
      title: 'Test Challenge',
      description: 'A test challenge',
      objectives: ['Complete 10 workouts'],
      exerciseTypes: ['cardio'],
      duration: 30,
      difficulty: 'beginner',
      creatorId: 'creator123',
    })

    const completedChallenge = challenge.complete()

    assert.equal(completedChallenge.status, ChallengeStatus.COMPLETED)
    assert.isTrue(completedChallenge.updatedAt > challenge.updatedAt)
  })

  test('should cancel challenge', ({ assert }) => {
    const challenge = new Challenge({
      id: '12345',
      title: 'Test Challenge',
      description: 'A test challenge',
      objectives: ['Complete 10 workouts'],
      exerciseTypes: ['cardio'],
      duration: 30,
      difficulty: 'beginner',
      creatorId: 'creator123',
    })

    const cancelledChallenge = challenge.cancel()

    assert.equal(cancelledChallenge.status, ChallengeStatus.CANCELLED)
    assert.isTrue(cancelledChallenge.updatedAt > challenge.updatedAt)
  })

  test('should correctly identify challenge status and gym association', ({ assert }) => {
    const activeChallenge = new Challenge({
      id: '1',
      title: 'Active Challenge',
      description: 'A test challenge',
      objectives: ['Complete 10 workouts'],
      exerciseTypes: ['cardio'],
      duration: 30,
      difficulty: 'beginner',
      creatorId: 'creator123',
      status: ChallengeStatus.ACTIVE,
    })

    const gymSpecificChallenge = new Challenge({
      id: '2',
      title: 'Gym Challenge',
      description: 'A gym-specific challenge',
      objectives: ['Complete 10 workouts'],
      exerciseTypes: ['cardio'],
      duration: 30,
      difficulty: 'beginner',
      creatorId: 'creator123',
      gymId: 'gym123',
    })

    assert.isTrue(activeChallenge.isActive())
    assert.isFalse(activeChallenge.isGymSpecific())

    assert.isTrue(gymSpecificChallenge.isActive())
    assert.isTrue(gymSpecificChallenge.isGymSpecific())
  })
})
