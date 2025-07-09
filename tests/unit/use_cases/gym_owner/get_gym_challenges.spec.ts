import { test } from '@japa/runner'
import { GetGymChallengesUseCase } from '../../../../app/application/use_cases/gym_owner/get_gym_challenges.js'
import { ChallengeRepository } from '../../../../app/domain/repositories/challenge_repository.js'
import { GymRepository } from '../../../../app/domain/repositories/gym_repository.js'
import { Challenge, ChallengeStatus } from '../../../../app/domain/entities/challenge.js'
import { Gym, GymStatus } from '../../../../app/domain/entities/gym.js'

test.group('GetGymChallengesUseCase', (group) => {
  let getGymChallengesUseCase: GetGymChallengesUseCase
  let mockChallengeRepository: ChallengeRepository
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

    getGymChallengesUseCase = new GetGymChallengesUseCase(
      mockChallengeRepository,
      mockGymRepository
    )
  })

  test('should return challenges for gym owner', async ({ assert }) => {
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
        title: 'Gym Challenge 1',
        description: 'Description 1',
        objectives: ['Objective 1'],
        exerciseTypes: ['Exercise 1'],
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
        title: 'Gym Challenge 2',
        description: 'Description 2',
        objectives: ['Objective 2'],
        exerciseTypes: ['Exercise 2'],
        duration: 45,
        difficulty: 'intermediate',
        status: ChallengeStatus.ACTIVE,
        creatorId: 'creator2',
        gymId: 'gym1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]

    mockGymRepository.findByOwnerId = async () => [mockGym]
    mockChallengeRepository.findByGymId = async () => mockChallenges

    const result = await getGymChallengesUseCase.execute({
      ownerId: 'owner1',
    })

    assert.equal(result.challenges.length, 2)
    assert.equal(result.challenges[0].gymId, 'gym1')
    assert.equal(result.challenges[1].gymId, 'gym1')
    assert.equal(result.gymInfo.id, 'gym1')
    assert.equal(result.gymInfo.name, 'Test Gym')
  })

  test('should throw error when gym owner has no gyms', async ({ assert }) => {
    mockGymRepository.findByOwnerId = async () => []

    await assert.rejects(async () => {
      await getGymChallengesUseCase.execute({
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

    const result = await getGymChallengesUseCase.execute({
      ownerId: 'owner1',
    })

    assert.equal(result.challenges.length, 0)
    assert.equal(result.gymInfo.id, 'gym1')
  })

  test('should filter challenges by status', async ({ assert }) => {
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

    mockGymRepository.findByOwnerId = async () => [mockGym]
    mockChallengeRepository.findByGymId = async () => mockChallenges

    const result = await getGymChallengesUseCase.execute({
      ownerId: 'owner1',
      status: ChallengeStatus.ACTIVE,
    })

    assert.equal(result.challenges.length, 1)
    assert.equal(result.challenges[0].status, ChallengeStatus.ACTIVE)
  })
})
