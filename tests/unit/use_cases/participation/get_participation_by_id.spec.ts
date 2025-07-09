import { test } from '@japa/runner'
import { GetParticipationByIdUseCase } from '../../../../app/application/use_cases/participation/get_participation_by_id.js'
import { ChallengeParticipationRepository } from '../../../../app/domain/repositories/challenge_participation_repository.js'
import {
  ChallengeParticipation,
  ParticipationStatus,
} from '../../../../app/domain/entities/challenge_participation.js'

test.group('GetParticipationByIdUseCase', (group) => {
  let getParticipationByIdUseCase: GetParticipationByIdUseCase
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

    getParticipationByIdUseCase = new GetParticipationByIdUseCase(mockParticipationRepository)
  })

  test('should return participation details when participation exists', async ({ assert }) => {
    const mockParticipation = new ChallengeParticipation({
      id: '1',
      userId: 'user1',
      challengeId: 'challenge1',
      status: ParticipationStatus.ACTIVE,
      joinedAt: new Date('2023-01-01'),
      workoutSessions: [
        {
          id: '1',
          date: new Date('2023-01-05'),
          duration: 30,
          caloriesBurned: 200,
          exercisesCompleted: ['Push-ups', 'Squats'],
          notes: 'Good workout',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })

    mockParticipationRepository.findById = async (id) => {
      return id === '1' ? mockParticipation : null
    }

    const result = await getParticipationByIdUseCase.execute({
      participationId: '1',
    })

    assert.equal(result.participation.id, '1')
    assert.equal(result.participation.userId, 'user1')
    assert.equal(result.participation.challengeId, 'challenge1')
    assert.equal(result.participation.status, ParticipationStatus.ACTIVE)
    assert.equal(result.participation.workoutSessions.length, 1)
    assert.equal(result.participation.workoutSessions[0].duration, 30)
  })

  test('should throw error when participation does not exist', async ({ assert }) => {
    mockParticipationRepository.findById = async () => null

    await assert.rejects(async () => {
      await getParticipationByIdUseCase.execute({
        participationId: 'nonexistent',
      })
    }, 'Participation not found')
  })

  test('should return completed participation details', async ({ assert }) => {
    const mockParticipation = new ChallengeParticipation({
      id: '1',
      userId: 'user1',
      challengeId: 'challenge1',
      status: ParticipationStatus.COMPLETED,
      joinedAt: new Date('2023-01-01'),
      completedAt: new Date('2023-02-01'),
      workoutSessions: [],
    })

    mockParticipationRepository.findById = async () => mockParticipation

    const result = await getParticipationByIdUseCase.execute({
      participationId: '1',
    })

    assert.equal(result.participation.status, ParticipationStatus.COMPLETED)
    assert.exists(result.participation.completedAt)
  })
})
