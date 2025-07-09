import { test } from '@japa/runner'
import { DeleteChallengeUseCase } from '../../../../app/application/use_cases/challenge/delete_challenge.js'
import { ChallengeRepository } from '../../../../app/domain/repositories/challenge_repository.js'
import { ChallengeParticipationRepository } from '../../../../app/domain/repositories/challenge_participation_repository.js'
import { Challenge, ChallengeStatus } from '../../../../app/domain/entities/challenge.js'
import {
  ChallengeParticipation,
  ParticipationStatus,
} from '../../../../app/domain/entities/challenge_participation.js'

test.group('DeleteChallengeUseCase', (group) => {
  let deleteChallengeUseCase: DeleteChallengeUseCase
  let mockChallengeRepository: ChallengeRepository
  let mockParticipationRepository: ChallengeParticipationRepository

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

    deleteChallengeUseCase = new DeleteChallengeUseCase(
      mockChallengeRepository,
      mockParticipationRepository
    )
  })

  test('should delete challenge successfully when user is creator and no participants', async ({
    assert,
  }) => {
    const mockChallenge = new Challenge({
      id: '1',
      title: 'Test Challenge',
      description: 'Test Description',
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
    mockParticipationRepository.findByChallengeId = async () => []
    mockChallengeRepository.delete = async (challengeId) => {
      assert.equal(challengeId, '1')
    }

    await deleteChallengeUseCase.execute({
      challengeId: '1',
      userId: 'user1',
    })

    // Test passes if no exception is thrown
    assert.isTrue(true)
  })

  test('should throw error when challenge does not exist', async ({ assert }) => {
    mockChallengeRepository.findById = async () => null

    await assert.rejects(async () => {
      await deleteChallengeUseCase.execute({
        challengeId: 'nonexistent',
        userId: 'user1',
      })
    }, 'Challenge not found')
  })

  test('should throw error when user is not the creator', async ({ assert }) => {
    const mockChallenge = new Challenge({
      id: '1',
      title: 'Test Challenge',
      description: 'Test Description',
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

    await assert.rejects(async () => {
      await deleteChallengeUseCase.execute({
        challengeId: '1',
        userId: 'user2', // Different user
      })
    }, 'Only the creator can delete this challenge')
  })

  test('should throw error when challenge has active participants', async ({ assert }) => {
    const mockChallenge = new Challenge({
      id: '1',
      title: 'Test Challenge',
      description: 'Test Description',
      objectives: ['Objective'],
      exerciseTypes: ['Exercise'],
      duration: 30,
      difficulty: 'beginner',
      status: ChallengeStatus.ACTIVE,
      creatorId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const mockParticipation = new ChallengeParticipation({
      id: '1',
      userId: 'user2',
      challengeId: '1',
      status: ParticipationStatus.ACTIVE,
      joinedAt: new Date(),
      workoutSessions: [],
    })

    mockChallengeRepository.findById = async () => mockChallenge
    mockParticipationRepository.findByChallengeId = async () => [mockParticipation]

    await assert.rejects(async () => {
      await deleteChallengeUseCase.execute({
        challengeId: '1',
        userId: 'user1',
      })
    }, 'Cannot delete challenge with active participants')
  })

  test('should allow deletion when all participants have abandoned or completed', async ({
    assert,
  }) => {
    const mockChallenge = new Challenge({
      id: '1',
      title: 'Test Challenge',
      description: 'Test Description',
      objectives: ['Objective'],
      exerciseTypes: ['Exercise'],
      duration: 30,
      difficulty: 'beginner',
      status: ChallengeStatus.ACTIVE,
      creatorId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const mockParticipation1 = new ChallengeParticipation({
      id: '1',
      userId: 'user2',
      challengeId: '1',
      status: ParticipationStatus.COMPLETED,
      joinedAt: new Date(),
      workoutSessions: [],
    })

    const mockParticipation2 = new ChallengeParticipation({
      id: '2',
      userId: 'user3',
      challengeId: '1',
      status: ParticipationStatus.ABANDONED,
      joinedAt: new Date(),
      workoutSessions: [],
    })

    mockChallengeRepository.findById = async () => mockChallenge
    mockParticipationRepository.findByChallengeId = async () => [
      mockParticipation1,
      mockParticipation2,
    ]
    mockChallengeRepository.delete = async (challengeId) => {
      assert.equal(challengeId, '1')
    }

    await deleteChallengeUseCase.execute({
      challengeId: '1',
      userId: 'user1',
    })

    // Test passes if no exception is thrown
    assert.isTrue(true)
  })
})
