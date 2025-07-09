import { test } from '@japa/runner'
import { DeleteWorkoutSessionUseCase } from '../../../../app/application/use_cases/participation/delete_workout_session.js'
import { ChallengeParticipationRepository } from '../../../../app/domain/repositories/challenge_participation_repository.js'
import {
  ChallengeParticipation,
  ParticipationStatus,
} from '../../../../app/domain/entities/challenge_participation.js'

test.group('DeleteWorkoutSessionUseCase', (group) => {
  let deleteWorkoutSessionUseCase: DeleteWorkoutSessionUseCase
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

    deleteWorkoutSessionUseCase = new DeleteWorkoutSessionUseCase(mockParticipationRepository)
  })

  test('should delete workout session successfully', async ({ assert }) => {
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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          date: new Date(),
          duration: 45,
          caloriesBurned: 300,
          exercisesCompleted: ['Squats'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })

    mockParticipationRepository.findById = async () => mockParticipation
    mockParticipationRepository.save = async (participation) => {
      assert.equal(participation.workoutSessions.length, 1)
      assert.equal(participation.workoutSessions[0].id, '2')
    }

    await deleteWorkoutSessionUseCase.execute({
      participationId: '1',
      workoutSessionId: '1',
    })
  })

  test('should throw error when participation does not exist', async ({ assert }) => {
    mockParticipationRepository.findById = async () => null

    await assert.rejects(async () => {
      await deleteWorkoutSessionUseCase.execute({
        participationId: 'nonexistent',
        workoutSessionId: '1',
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
      await deleteWorkoutSessionUseCase.execute({
        participationId: '1',
        workoutSessionId: 'nonexistent',
      })
    }, 'Workout session not found')
  })

  test('should handle deleting the only workout session', async ({ assert }) => {
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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })

    mockParticipationRepository.findById = async () => mockParticipation
    mockParticipationRepository.save = async (participation) => {
      assert.equal(participation.workoutSessions.length, 0)
    }

    await deleteWorkoutSessionUseCase.execute({
      participationId: '1',
      workoutSessionId: '1',
    })
  })
})
