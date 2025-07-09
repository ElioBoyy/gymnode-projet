import { test } from '@japa/runner'
import { GetChallengesUseCase } from '../../../../app/application/use_cases/challenge/get_challenges.js'
import { ChallengeRepository } from '../../../../app/domain/repositories/challenge_repository.js'
import { Challenge, ChallengeStatus } from '../../../../app/domain/entities/challenge.js'

test.group('GetChallengesUseCase', (group) => {
  let getChallengesUseCase: GetChallengesUseCase
  let mockChallengeRepository: ChallengeRepository

  group.setup(async () => {
    mockChallengeRepository = {
      findAll: async () => [],
      findById: async () => null,
      findByCreatorId: async () => [],
      findByStatus: async () => [],
      findByGymId: async () => [],
      save: async () => {},
      delete: async () => {},
    } as ChallengeRepository

    getChallengesUseCase = new GetChallengesUseCase(mockChallengeRepository)
  })

  test('should return paginated challenges with default pagination', async ({ assert }) => {
    const mockChallenges = [
      new Challenge({
        id: '1',
        title: 'Challenge 1',
        description: 'Description 1',
        objectives: ['Objective 1'],
        exerciseTypes: ['Exercise 1'],
        duration: 30,
        difficulty: 'beginner',
        status: ChallengeStatus.ACTIVE,
        creatorId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new Challenge({
        id: '2',
        title: 'Challenge 2',
        description: 'Description 2',
        objectives: ['Objective 2'],
        exerciseTypes: ['Exercise 2'],
        duration: 45,
        difficulty: 'intermediate',
        status: ChallengeStatus.ACTIVE,
        creatorId: 'user2',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]

    mockChallengeRepository.findAll = async () => mockChallenges

    const result = await getChallengesUseCase.execute({})

    assert.equal(result.challenges.length, 2)
    assert.equal(result.pagination.page, 1)
    assert.equal(result.pagination.limit, 20)
    assert.equal(result.pagination.total, 2)
    assert.equal(result.pagination.totalPages, 1)
  })

  test('should filter challenges by status', async ({ assert }) => {
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
        creatorId: 'user1',
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
        creatorId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]

    mockChallengeRepository.findAll = async () => mockChallenges

    const result = await getChallengesUseCase.execute({
      status: ChallengeStatus.ACTIVE,
    })

    assert.equal(result.challenges.length, 1)
    assert.equal(result.challenges[0].status, ChallengeStatus.ACTIVE)
  })

  test('should filter challenges by difficulty', async ({ assert }) => {
    const mockChallenges = [
      new Challenge({
        id: '1',
        title: 'Beginner Challenge',
        description: 'Description',
        objectives: ['Objective'],
        exerciseTypes: ['Exercise'],
        duration: 30,
        difficulty: 'beginner',
        status: ChallengeStatus.ACTIVE,
        creatorId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new Challenge({
        id: '2',
        title: 'Advanced Challenge',
        description: 'Description',
        objectives: ['Objective'],
        exerciseTypes: ['Exercise'],
        duration: 30,
        difficulty: 'advanced',
        status: ChallengeStatus.ACTIVE,
        creatorId: 'user1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]

    mockChallengeRepository.findAll = async () => mockChallenges

    const result = await getChallengesUseCase.execute({
      difficulty: 'beginner',
    })

    assert.equal(result.challenges.length, 1)
    assert.equal(result.challenges[0].difficulty, 'beginner')
  })

  test('should handle pagination correctly', async ({ assert }) => {
    const mockChallenges = Array.from(
      { length: 25 },
      (_, i) =>
        new Challenge({
          id: `${i + 1}`,
          title: `Challenge ${i + 1}`,
          description: 'Description',
          objectives: ['Objective'],
          exerciseTypes: ['Exercise'],
          duration: 30,
          difficulty: 'beginner',
          status: ChallengeStatus.ACTIVE,
          creatorId: 'user1',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
    )

    mockChallengeRepository.findAll = async () => mockChallenges

    const result = await getChallengesUseCase.execute({
      page: 2,
      limit: 10,
    })

    assert.equal(result.challenges.length, 10)
    assert.equal(result.pagination.page, 2)
    assert.equal(result.pagination.limit, 10)
    assert.equal(result.pagination.total, 25)
    assert.equal(result.pagination.totalPages, 3)
  })

  test('should return empty array when no challenges exist', async ({ assert }) => {
    mockChallengeRepository.findAll = async () => []

    const result = await getChallengesUseCase.execute({})

    assert.equal(result.challenges.length, 0)
    assert.equal(result.pagination.total, 0)
  })
})
