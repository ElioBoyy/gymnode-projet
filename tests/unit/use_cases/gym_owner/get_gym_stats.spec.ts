import { test } from '@japa/runner'
import { GetGymStatsUseCase } from '../../../../app/application/use_cases/gym_owner/get_gym_stats.js'
import { ChallengeRepository } from '../../../../app/domain/repositories/challenge_repository.js'
import { ChallengeParticipationRepository } from '../../../../app/domain/repositories/challenge_participation_repository.js'
import { GymRepository } from '../../../../app/domain/repositories/gym_repository.js'
import { Challenge, ChallengeStatus } from '../../../../app/domain/entities/challenge.js'
import {
  ChallengeParticipation,
  ParticipationStatus,
} from '../../../../app/domain/entities/challenge_participation.js'
import { Gym, GymStatus } from '../../../../app/domain/entities/gym.js'

test.group('GetGymStatsUseCase', (group) => {
  let getGymStatsUseCase: GetGymStatsUseCase
  let mockChallengeRepository: ChallengeRepository
  let mockParticipationRepository: ChallengeParticipationRepository
  let mockGymRepository: GymRepository

  group.setup(async () => {
    mockChallengeRepository = {
      findAll: async () => [],
      findById: async () => null,
      findByCreatorId: async () => [],
      findByStatus: async () => [],
      findByGymId: async () => [],
      findByDifficulty: async () => [],
      findActive: async () => [],
      save: async () => {},
      update: async () => {},
      delete: async () => {},
      exists: async () => false,
    } as ChallengeRepository

    mockParticipationRepository = {
      findAll: async () => [],
      findById: async () => null,
      findByUserId: async () => [],
      findByChallengeId: async () => [],
      findByUserAndChallenge: async () => null,
      findByStatus: async () => [],
      findActiveByUserId: async () => [],
      getLeaderboard: async () => [],
      save: async () => {},
      update: async () => {},
      delete: async () => {},
      exists: async () => false,
    } as ChallengeParticipationRepository

    mockGymRepository = {
      findAll: async () => [],
      findById: async () => null,
      findByOwnerId: async () => [],
      findByStatus: async () => [],
      save: async () => {},
      update: async () => {},
      delete: async () => {},
      exists: async () => false,
    } as GymRepository

    getGymStatsUseCase = new GetGymStatsUseCase(
      mockChallengeRepository,
      mockParticipationRepository,
      mockGymRepository
    )
  })

  test('should return comprehensive gym statistics', async ({ assert }) => {
    const mockGym = new Gym({
      id: 'gym1',
      name: 'Test Gym',
      address: '123 Street',
      contact: 'contact@gym.com',
      description: 'Description',
      capacity: 100,
      equipment: ['Equipment'],
      activities: ['Activity'],
      status: GymStatus.APPROVED,
      ownerId: 'owner1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const mockChallenges = [
      new Challenge({
        id: '1',
        title: 'Active Challenge',
        description: 'Description',
        objectives: ['Objective'],
        exerciseTypes: ['Exercise'],
        duration: 30,
        difficulty: 'beginner',
        status: ChallengeStatus.ACTIVE,
        creatorId: 'creator1',
        gymId: 'gym1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new Challenge({
        id: '2',
        title: 'Completed Challenge',
        description: 'Description',
        objectives: ['Objective'],
        exerciseTypes: ['Exercise'],
        duration: 30,
        difficulty: 'beginner',
        status: ChallengeStatus.COMPLETED,
        creatorId: 'creator1',
        gymId: 'gym1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]

    const mockParticipations = [
      new ChallengeParticipation({
        id: '1',
        userId: 'user1',
        challengeId: '1',
        status: ParticipationStatus.ACTIVE,
        joinedAt: new Date(),
        workoutSessions: [
          {
            id: '1',
            date: new Date(),
            duration: 30,
            caloriesBurned: 200,
            exercisesCompleted: ['Exercise'],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }),
      new ChallengeParticipation({
        id: '2',
        userId: 'user2',
        challengeId: '2',
        status: ParticipationStatus.COMPLETED,
        joinedAt: new Date(),
        completedAt: new Date(),
        workoutSessions: [
          {
            id: '2',
            date: new Date(),
            duration: 45,
            caloriesBurned: 300,
            exercisesCompleted: ['Exercise'],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }),
    ]

    mockGymRepository.findByOwnerId = async () => [mockGym]
    mockChallengeRepository.findByGymId = async () => mockChallenges
    mockParticipationRepository.findByChallengeId = async (challengeId) => {
      return mockParticipations.filter((p) => p.challengeId === challengeId)
    }

    const result = await getGymStatsUseCase.execute({
      ownerId: 'owner1',
    })

    assert.equal(result.gymInfo.id, 'gym1')
    assert.equal(result.totalChallenges, 2)
    assert.equal(result.activeChallenges, 1)
    assert.equal(result.completedChallenges, 1)
    assert.equal(result.totalParticipants, 2)
    assert.equal(result.totalWorkouts, 2)
    assert.equal(result.totalCaloriesBurned, 500)
  })

  test('should throw error when gym owner has no gyms', async ({ assert }) => {
    mockGymRepository.findByOwnerId = async () => []

    await assert.rejects(async () => {
      await getGymStatsUseCase.execute({
        ownerId: 'owner-without-gym',
      })
    }, 'No gym found for this owner')
  })

  test('should handle gym with no challenges', async ({ assert }) => {
    const mockGym = new Gym({
      id: 'gym1',
      name: 'Test Gym',
      address: '123 Street',
      contact: 'contact@gym.com',
      description: 'Description',
      capacity: 100,
      equipment: ['Equipment'],
      activities: ['Activity'],
      status: GymStatus.APPROVED,
      ownerId: 'owner1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockGymRepository.findByOwnerId = async () => [mockGym]
    mockChallengeRepository.findByGymId = async () => []

    const result = await getGymStatsUseCase.execute({
      ownerId: 'owner1',
    })

    assert.equal(result.totalChallenges, 0)
    assert.equal(result.activeChallenges, 0)
    assert.equal(result.completedChallenges, 0)
    assert.equal(result.totalParticipants, 0)
    assert.equal(result.totalWorkouts, 0)
    assert.equal(result.totalCaloriesBurned, 0)
  })
})
