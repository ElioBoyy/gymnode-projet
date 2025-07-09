import { test } from '@japa/runner'
import {
  ChallengeParticipation,
  ParticipationStatus,
  WorkoutSession,
} from '../../../app/domain/entities/challenge_participation.js'

test.group('ChallengeParticipation Entity', (group) => {
  test('should create a participation with default values', async ({ assert }) => {
    const participation = new ChallengeParticipation({
      id: '1',
      challengeId: 'challenge-1',
      userId: 'user-1',
    })

    assert.equal(participation.id, '1')
    assert.equal(participation.challengeId, 'challenge-1')
    assert.equal(participation.userId, 'user-1')
    assert.equal(participation.status, ParticipationStatus.ACTIVE)
    assert.equal(participation.progress, 0)
    assert.deepEqual(participation.workoutSessions, [])
    assert.instanceOf(participation.joinedAt, Date)
    assert.isUndefined(participation.completedAt)
    assert.instanceOf(participation.updatedAt, Date)
  })

  test('should create a participation with custom values', async ({ assert }) => {
    const joinedAt = new Date('2023-01-01')
    const completedAt = new Date('2023-01-15')
    const updatedAt = new Date('2023-01-16')

    const workoutSessions: WorkoutSession[] = [
      {
        id: 'session-1',
        date: new Date('2023-01-02'),
        duration: 60,
        caloriesBurned: 300,
        exercisesCompleted: ['push-ups', 'squats'],
        notes: 'Great workout',
        createdAt: new Date('2023-01-02'),
        updatedAt: new Date('2023-01-02'),
      },
    ]

    const participation = new ChallengeParticipation({
      id: '2',
      challengeId: 'challenge-2',
      userId: 'user-2',
      status: ParticipationStatus.COMPLETED,
      progress: 100,
      workoutSessions,
      joinedAt,
      completedAt,
      updatedAt,
    })

    assert.equal(participation.status, ParticipationStatus.COMPLETED)
    assert.equal(participation.progress, 100)
    assert.deepEqual(participation.workoutSessions, workoutSessions)
    assert.equal(participation.joinedAt, joinedAt)
    assert.equal(participation.completedAt, completedAt)
    assert.equal(participation.updatedAt, updatedAt)
  })

  test('should add a workout session', async ({ assert }) => {
    const participation = new ChallengeParticipation({
      id: '1',
      challengeId: 'challenge-1',
      userId: 'user-1',
    })

    const sessionData = {
      date: new Date(),
      duration: 45,
      caloriesBurned: 250,
      exercisesCompleted: ['running'],
      notes: 'Morning run',
    }

    const updatedParticipation = participation.addWorkoutSession(sessionData)

    assert.equal(participation.workoutSessions.length, 0) // Original unchanged
    assert.equal(updatedParticipation.workoutSessions.length, 1)

    const addedSession = updatedParticipation.workoutSessions[0]
    assert.equal(addedSession.duration, sessionData.duration)
    assert.equal(addedSession.caloriesBurned, sessionData.caloriesBurned)
    assert.deepEqual(addedSession.exercisesCompleted, sessionData.exercisesCompleted)
    assert.equal(addedSession.notes, sessionData.notes)
    assert.isString(addedSession.id)
    assert.instanceOf(addedSession.createdAt, Date)
    assert.instanceOf(addedSession.updatedAt, Date)
  })

  test('should update progress', async ({ assert }) => {
    const participation = new ChallengeParticipation({
      id: '1',
      challengeId: 'challenge-1',
      userId: 'user-1',
      progress: 50,
    })

    const updatedParticipation = participation.updateProgress(80)

    assert.equal(participation.progress, 50) // Original unchanged
    assert.equal(updatedParticipation.progress, 80)
    assert.equal(updatedParticipation.status, ParticipationStatus.ACTIVE)
    assert.isTrue(updatedParticipation.updatedAt > participation.updatedAt)
  })

  test('should complete participation when progress reaches 100', async ({ assert }) => {
    const participation = new ChallengeParticipation({
      id: '1',
      challengeId: 'challenge-1',
      userId: 'user-1',
      progress: 80,
    })

    const completedParticipation = participation.updateProgress(100)

    assert.equal(completedParticipation.progress, 100)
    assert.equal(completedParticipation.status, ParticipationStatus.COMPLETED)
    assert.instanceOf(completedParticipation.completedAt, Date)
  })

  test('should abandon participation', async ({ assert }) => {
    const participation = new ChallengeParticipation({
      id: '1',
      challengeId: 'challenge-1',
      userId: 'user-1',
    })

    const abandonedParticipation = participation.abandon()

    assert.equal(participation.status, ParticipationStatus.ACTIVE) // Original unchanged
    assert.equal(abandonedParticipation.status, ParticipationStatus.ABANDONED)
    assert.isTrue(abandonedParticipation.updatedAt > participation.updatedAt)
  })

  test('should calculate total calories burned', async ({ assert }) => {
    const workoutSessions: WorkoutSession[] = [
      {
        id: 'session-1',
        date: new Date(),
        duration: 60,
        caloriesBurned: 300,
        exercisesCompleted: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'session-2',
        date: new Date(),
        duration: 45,
        caloriesBurned: 250,
        exercisesCompleted: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const participation = new ChallengeParticipation({
      id: '1',
      challengeId: 'challenge-1',
      userId: 'user-1',
      workoutSessions,
    })

    assert.equal(participation.getTotalCaloriesBurned(), 550)
  })

  test('should calculate total workout time', async ({ assert }) => {
    const workoutSessions: WorkoutSession[] = [
      {
        id: 'session-1',
        date: new Date(),
        duration: 60,
        caloriesBurned: 300,
        exercisesCompleted: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'session-2',
        date: new Date(),
        duration: 45,
        caloriesBurned: 250,
        exercisesCompleted: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    const participation = new ChallengeParticipation({
      id: '1',
      challengeId: 'challenge-1',
      userId: 'user-1',
      workoutSessions,
    })

    assert.equal(participation.getTotalWorkoutTime(), 105)
  })

  test('should check if participation is completed', async ({ assert }) => {
    const activeParticipation = new ChallengeParticipation({
      id: '1',
      challengeId: 'challenge-1',
      userId: 'user-1',
    })

    const completedParticipation = new ChallengeParticipation({
      id: '2',
      challengeId: 'challenge-2',
      userId: 'user-2',
      status: ParticipationStatus.COMPLETED,
    })

    assert.isFalse(activeParticipation.isCompleted())
    assert.isTrue(completedParticipation.isCompleted())
  })

  test('should get progress', async ({ assert }) => {
    const participation = new ChallengeParticipation({
      id: '1',
      challengeId: 'challenge-1',
      userId: 'user-1',
      progress: 75,
    })

    assert.equal(participation.getProgress(), 75)
  })
})
