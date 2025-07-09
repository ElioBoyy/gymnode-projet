import { test } from '@japa/runner'
import { UpdateChallengeUseCase } from '../../../../app/application/use_cases/challenge/update_challenge.js'
import { ChallengeRepository } from '../../../../app/domain/repositories/challenge_repository.js'
import { Challenge, ChallengeStatus } from '../../../../app/domain/entities/challenge.js'

test.group('UpdateChallengeUseCase', (group) => {
  let updateChallengeUseCase: UpdateChallengeUseCase
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

    updateChallengeUseCase = new UpdateChallengeUseCase(mockChallengeRepository)
  })

  test('should update challenge successfully when user is creator', async ({ assert }) => {
    const mockChallenge = new Challenge({
      id: '1',
      title: 'Original Title',
      description: 'Original Description',
      objectives: ['Original Objective'],
      exerciseTypes: ['Original Exercise'],
      duration: 30,
      difficulty: 'beginner',
      status: ChallengeStatus.ACTIVE,
      creatorId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockChallengeRepository.findById = async () => mockChallenge
    mockChallengeRepository.save = async (challenge) => {
      // Simulate saving the challenge
    }

    const result = await updateChallengeUseCase.execute({
      challengeId: '1',
      userId: 'user1',
      title: 'Updated Title',
      description: 'Updated Description',
      duration: 45,
      difficulty: 'intermediate',
    })

    assert.equal(result.challenge.title, 'Updated Title')
    assert.equal(result.challenge.description, 'Updated Description')
    assert.equal(result.challenge.duration, 45)
    assert.equal(result.challenge.difficulty, 'intermediate')
    assert.equal(result.challenge.id, '1')
    assert.equal(result.challenge.creatorId, 'user1')
  })

  test('should throw error when challenge does not exist', async ({ assert }) => {
    mockChallengeRepository.findById = async () => null

    await assert.rejects(async () => {
      await updateChallengeUseCase.execute({
        challengeId: 'nonexistent',
        userId: 'user1',
        title: 'Updated Title',
      })
    }, 'Challenge not found')
  })

  test('should throw error when user is not the creator', async ({ assert }) => {
    const mockChallenge = new Challenge({
      id: '1',
      title: 'Original Title',
      description: 'Original Description',
      objectives: ['Original Objective'],
      exerciseTypes: ['Original Exercise'],
      duration: 30,
      difficulty: 'beginner',
      status: ChallengeStatus.ACTIVE,
      creatorId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockChallengeRepository.findById = async () => mockChallenge

    await assert.rejects(async () => {
      await updateChallengeUseCase.execute({
        challengeId: '1',
        userId: 'user2', // Different user
        title: 'Updated Title',
      })
    }, 'Only the creator can update this challenge')
  })

  test('should update only provided fields', async ({ assert }) => {
    const mockChallenge = new Challenge({
      id: '1',
      title: 'Original Title',
      description: 'Original Description',
      objectives: ['Original Objective'],
      exerciseTypes: ['Original Exercise'],
      duration: 30,
      difficulty: 'beginner',
      status: ChallengeStatus.ACTIVE,
      creatorId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockChallengeRepository.findById = async () => mockChallenge
    mockChallengeRepository.save = async (challenge) => {}

    const result = await updateChallengeUseCase.execute({
      challengeId: '1',
      userId: 'user1',
      title: 'Updated Title Only',
    })

    assert.equal(result.challenge.title, 'Updated Title Only')
    assert.equal(result.challenge.description, 'Original Description')
    assert.equal(result.challenge.duration, 30)
    assert.equal(result.challenge.difficulty, 'beginner')
  })

  test('should update objectives and exercise types', async ({ assert }) => {
    const mockChallenge = new Challenge({
      id: '1',
      title: 'Original Title',
      description: 'Original Description',
      objectives: ['Original Objective'],
      exerciseTypes: ['Original Exercise'],
      duration: 30,
      difficulty: 'beginner',
      status: ChallengeStatus.ACTIVE,
      creatorId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockChallengeRepository.findById = async () => mockChallenge
    mockChallengeRepository.save = async (challenge) => {}

    const result = await updateChallengeUseCase.execute({
      challengeId: '1',
      userId: 'user1',
      objectives: ['New Objective 1', 'New Objective 2'],
      exerciseTypes: ['New Exercise 1', 'New Exercise 2'],
    })

    assert.deepEqual(result.challenge.objectives, ['New Objective 1', 'New Objective 2'])
    assert.deepEqual(result.challenge.exerciseTypes, ['New Exercise 1', 'New Exercise 2'])
  })

  test('should update maxParticipants when provided', async ({ assert }) => {
    const mockChallenge = new Challenge({
      id: '1',
      title: 'Original Title',
      description: 'Original Description',
      objectives: ['Original Objective'],
      exerciseTypes: ['Original Exercise'],
      duration: 30,
      difficulty: 'beginner',
      status: ChallengeStatus.ACTIVE,
      creatorId: 'user1',
      maxParticipants: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockChallengeRepository.findById = async () => mockChallenge
    mockChallengeRepository.save = async (challenge) => {}

    const result = await updateChallengeUseCase.execute({
      challengeId: '1',
      userId: 'user1',
      maxParticipants: 100,
    })

    assert.equal(result.challenge.maxParticipants, 100)
  })
})
