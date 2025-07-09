import { test } from '@japa/runner'
import { GetUserParticipationsUseCase } from '../../../../app/application/use_cases/participation/get_user_participations.js'
import { ChallengeParticipationRepository } from '../../../../app/domain/repositories/challenge_participation_repository.js'
import {
  ChallengeParticipation,
  ParticipationStatus,
} from '../../../../app/domain/entities/challenge_participation.js'

test.group('GetUserParticipationsUseCase', (group) => {
  let getUserParticipationsUseCase: GetUserParticipationsUseCase
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

    getUserParticipationsUseCase = new GetUserParticipationsUseCase(mockParticipationRepository)
  })

  test('should return user participations', async ({ assert }) => {
    const mockParticipations = [
      new ChallengeParticipation({
        id: '1',
        userId: 'user1',
        challengeId: 'challenge1',
        status: ParticipationStatus.ACTIVE,
        joinedAt: new Date('2023-01-01'),
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
      }),
      new ChallengeParticipation({
        id: '2',
        userId: 'user1',
        challengeId: 'challenge2',
        status: ParticipationStatus.COMPLETED,
        joinedAt: new Date('2023-01-05'),
        completedAt: new Date('2023-02-05'),
        workoutSessions: [],
      }),
    ]

    mockParticipationRepository.findByUserId = async (userId) => {
      return userId === 'user1' ? mockParticipations : []
    }

    const result = await getUserParticipationsUseCase.execute({
      userId: 'user1',
    })

    assert.equal(result.participations.length, 2)
    assert.equal(result.participations[0].userId, 'user1')
    assert.equal(result.participations[0].challengeId, 'challenge1')
    assert.equal(result.participations[0].status, ParticipationStatus.ACTIVE)
    assert.equal(result.participations[1].status, ParticipationStatus.COMPLETED)
  })

  test('should filter participations by status', async ({ assert }) => {
    const mockParticipations = [
      new ChallengeParticipation({
        id: '1',
        userId: 'user1',
        challengeId: 'challenge1',
        status: ParticipationStatus.ACTIVE,
        joinedAt: new Date(),
        workoutSessions: [],
      }),
      new ChallengeParticipation({
        id: '2',
        userId: 'user1',
        challengeId: 'challenge2',
        status: ParticipationStatus.COMPLETED,
        joinedAt: new Date(),
        workoutSessions: [],
      }),
    ]

    mockParticipationRepository.findByUserId = async () => mockParticipations

    const result = await getUserParticipationsUseCase.execute({
      userId: 'user1',
      status: ParticipationStatus.ACTIVE,
    })

    assert.equal(result.participations.length, 1)
    assert.equal(result.participations[0].status, ParticipationStatus.ACTIVE)
  })

  test('should return empty array when user has no participations', async ({ assert }) => {
    mockParticipationRepository.findByUserId = async () => []

    const result = await getUserParticipationsUseCase.execute({
      userId: 'user-without-participations',
    })

    assert.equal(result.participations.length, 0)
  })
})
