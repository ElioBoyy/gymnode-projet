import { test } from '@japa/runner'
import { GetChallengeByIdUseCase } from '../../../../app/application/use_cases/challenge/get_challenge_by_id.js'
import { ChallengeRepository } from '../../../../app/domain/repositories/challenge_repository.js'
import { Challenge, ChallengeStatus } from '../../../../app/domain/entities/challenge.js'

test.group('GetChallengeByIdUseCase', (group) => {
  let getChallengeByIdUseCase: GetChallengeByIdUseCase
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

    getChallengeByIdUseCase = new GetChallengeByIdUseCase(mockChallengeRepository)
  })

  test('should return challenge details when challenge exists', async ({ assert }) => {
    const mockChallenge = new Challenge({
      id: '1',
      title: 'Test Challenge',
      description: 'Test Description',
      objectives: ['Objective 1', 'Objective 2'],
      exerciseTypes: ['Exercise 1', 'Exercise 2'],
      duration: 30,
      difficulty: 'intermediate',
      status: ChallengeStatus.ACTIVE,
      creatorId: 'user1',
      gymId: 'gym1',
      maxParticipants: 50,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
    })

    mockChallengeRepository.findById = async (id) => {
      return id === '1' ? mockChallenge : null
    }

    const result = await getChallengeByIdUseCase.execute({
      challengeId: '1',
    })

    assert.equal(result.challenge.id, '1')
    assert.equal(result.challenge.title, 'Test Challenge')
    assert.equal(result.challenge.description, 'Test Description')
    assert.deepEqual(result.challenge.objectives, ['Objective 1', 'Objective 2'])
    assert.deepEqual(result.challenge.exerciseTypes, ['Exercise 1', 'Exercise 2'])
    assert.equal(result.challenge.duration, 30)
    assert.equal(result.challenge.difficulty, 'intermediate')
    assert.equal(result.challenge.status, ChallengeStatus.ACTIVE)
    assert.equal(result.challenge.creatorId, 'user1')
    assert.equal(result.challenge.gymId, 'gym1')
    assert.equal(result.challenge.maxParticipants, 50)
  })

  test('should throw error when challenge does not exist', async ({ assert }) => {
    mockChallengeRepository.findById = async () => null

    await assert.rejects(async () => {
      await getChallengeByIdUseCase.execute({
        challengeId: 'nonexistent',
      })
    }, 'Challenge not found')
  })

  test('should handle challenge without optional fields', async ({ assert }) => {
    const mockChallenge = new Challenge({
      id: '1',
      title: 'Simple Challenge',
      description: 'Simple Description',
      objectives: ['Objective'],
      exerciseTypes: ['Exercise'],
      duration: 30,
      difficulty: 'beginner',
      status: ChallengeStatus.ACTIVE,
      creatorId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockChallengeRepository.findById = async () => mockChallenge

    const result = await getChallengeByIdUseCase.execute({
      challengeId: '1',
    })

    assert.equal(result.challenge.id, '1')
    assert.equal(result.challenge.gymId, undefined)
    assert.equal(result.challenge.maxParticipants, undefined)
  })
})
