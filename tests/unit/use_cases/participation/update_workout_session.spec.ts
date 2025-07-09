import { test } from '@japa/runner'
import { UpdateWorkoutSessionUseCase } from '../../../../app/application/use_cases/participation/update_workout_session.js'
import { ChallengeParticipationRepository } from '../../../../app/domain/repositories/challenge_participation_repository.js'
import {
  ChallengeParticipation,
  ParticipationStatus,
} from '../../../../app/domain/entities/challenge_participation.js'

test.group('UpdateWorkoutSessionUseCase', (group) => {
  let updateWorkoutSessionUseCase: UpdateWorkoutSessionUseCase
  let mockParticipationRepository: ChallengeParticipationRepository

  group.setup(async () => {
    mockParticipationRepository = {
      findAll: async () => [],
      findById: async () => null,
      findByUserId: async () => [],
      findByChallengeId: async () => [],
      findByUserAndChallenge: async () => null,
      findByStatus: async () => [],
      save: async () => {},
      delete: async () => {},
    } as ChallengeParticipationRepository

    updateWorkoutSessionUseCase = new UpdateWorkoutSessionUseCase(mockParticipationRepository)
  })

  test('should update workout session successfully', async ({ assert }) => {
    const mockParticipation = new ChallengeParticipation({
      id: '1',
      userId: 'user1',
      challengeId: 'challenge1',
      status: ParticipationStatus.ACTIVE,
      joinedAt: new Date(),
      workoutSessions: [
        {
          id: '1',
          date: new Date(),
          duration: 30,
          caloriesBurned: 200,
          exercisesCompleted: ['Push-ups'],
          notes: 'Original notes',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })

    mockParticipationRepository.findById = async () => mockParticipation
    mockParticipationRepository.save = async (participation) => {}

    const result = await updateWorkoutSessionUseCase.execute({
      participationId: '1',
      workoutSessionId: '1',
      duration: 45,
      caloriesBurned: 300,
      exercisesCompleted: ['Push-ups', 'Squats'],
      notes: 'Updated notes',
    })

    assert.equal(result.workoutSession.duration, 45)
    assert.equal(result.workoutSession.caloriesBurned, 300)
    assert.deepEqual(result.workoutSession.exercisesCompleted, ['Push-ups', 'Squats'])
    assert.equal(result.workoutSession.notes, 'Updated notes')
  })

  test('should throw error when participation does not exist', async ({ assert }) => {
    mockParticipationRepository.findById = async () => null

    await assert.rejects(async () => {
      await updateWorkoutSessionUseCase.execute({
        participationId: 'nonexistent',
        workoutSessionId: '1',
        duration: 45,
      })
    }, 'Participation not found')
  })

  test('should throw error when workout session does not exist', async ({ assert }) => {
    const mockParticipation = new ChallengeParticipation({
      id: '1',
      userId: 'user1',
      challengeId: 'challenge1',
      status: ParticipationStatus.ACTIVE,
      joinedAt: new Date(),
      workoutSessions: [],
    })

    mockParticipationRepository.findById = async () => mockParticipation

    await assert.rejects(async () => {
      await updateWorkoutSessionUseCase.execute({
        participationId: '1',
        workoutSessionId: 'nonexistent',
        duration: 45,
      })
    }, 'Workout session not found')
  })

  test('should update only provided fields', async ({ assert }) => {
    const mockParticipation = new ChallengeParticipation({
      id: '1',
      userId: 'user1',
      challengeId: 'challenge1',
      status: ParticipationStatus.ACTIVE,
      joinedAt: new Date(),
      workoutSessions: [
        {
          id: '1',
          date: new Date(),
          duration: 30,
          caloriesBurned: 200,
          exercisesCompleted: ['Push-ups'],
          notes: 'Original notes',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })

    mockParticipationRepository.findById = async () => mockParticipation
    mockParticipationRepository.save = async (participation) => {}

    const result = await updateWorkoutSessionUseCase.execute({
      participationId: '1',
      workoutSessionId: '1',
      duration: 45,
    })

    assert.equal(result.workoutSession.duration, 45)
    assert.equal(result.workoutSession.caloriesBurned, 200)
    assert.deepEqual(result.workoutSession.exercisesCompleted, ['Push-ups'])
    assert.equal(result.workoutSession.notes, 'Original notes')
  })
})
