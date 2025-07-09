import { test } from '@japa/runner'
import { LeaveChallengeUseCase } from '../../../../app/application/use_cases/challenge/leave_challenge.js'
import { ChallengeParticipationRepository } from '../../../../app/domain/repositories/challenge_participation_repository.js'
import {
  ChallengeParticipation,
  ParticipationStatus,
} from '../../../../app/domain/entities/challenge_participation.js'

test.group('LeaveChallengeUseCase', (group) => {
  let leaveChallengeUseCase: LeaveChallengeUseCase
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

    leaveChallengeUseCase = new LeaveChallengeUseCase(mockParticipationRepository)
  })

  test('should leave challenge successfully when user is participant', async ({ assert }) => {
    const mockParticipation = new ChallengeParticipation({
      id: '1',
      userId: 'user1',
      challengeId: 'challenge1',
      status: ParticipationStatus.ACTIVE,
      joinedAt: new Date(),
      workoutSessions: [],
    })

    mockParticipationRepository.findByUserAndChallenge = async (userId, challengeId) => {
      if (userId === 'user1' && challengeId === 'challenge1') {
        return mockParticipation
      }
      return null
    }

    let abandonedParticipation: ChallengeParticipation | null = null
    mockParticipationRepository.save = async (participation) => {
      abandonedParticipation = participation
    }

    await leaveChallengeUseCase.execute({
      challengeId: 'challenge1',
      userId: 'user1',
    })

    assert.isNotNull(abandonedParticipation)
    assert.equal(abandonedParticipation?.status, 'abandoned')
    assert.isNotNull(abandonedParticipation?.abandonedAt)
  })

  test('should throw error when participation does not exist', async ({ assert }) => {
    mockParticipationRepository.findByUserAndChallenge = async () => null

    await assert.rejects(async () => {
      await leaveChallengeUseCase.execute({
        challengeId: 'challenge1',
        userId: 'user1',
      })
    }, 'Participation not found')
  })

  test('should throw error when trying to leave completed challenge', async ({ assert }) => {
    const mockParticipation = new ChallengeParticipation({
      id: '1',
      userId: 'user1',
      challengeId: 'challenge1',
      status: ParticipationStatus.COMPLETED,
      joinedAt: new Date(),
      workoutSessions: [],
    })

    mockParticipationRepository.findByUserAndChallenge = async () => mockParticipation

    await assert.rejects(async () => {
      await leaveChallengeUseCase.execute({
        challengeId: 'challenge1',
        userId: 'user1',
      })
    }, 'Cannot leave a completed challenge')
  })

  test('should throw error when trying to leave already abandoned challenge', async ({
    assert,
  }) => {
    const mockParticipation = new ChallengeParticipation({
      id: '1',
      userId: 'user1',
      challengeId: 'challenge1',
      status: ParticipationStatus.ABANDONED,
      joinedAt: new Date(),
      workoutSessions: [],
    })

    mockParticipationRepository.findByUserAndChallenge = async () => mockParticipation

    await assert.rejects(async () => {
      await leaveChallengeUseCase.execute({
        challengeId: 'challenge1',
        userId: 'user1',
      })
    }, 'Challenge participation already abandoned')
  })

  test('should handle leaving challenge with workout sessions', async ({ assert }) => {
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
          exercisesCompleted: ['Exercise 1'],
        },
      ],
    })

    mockParticipationRepository.findByUserAndChallenge = async () => mockParticipation

    let abandonedParticipation: ChallengeParticipation | null = null
    mockParticipationRepository.save = async (participation) => {
      abandonedParticipation = participation
    }

    await leaveChallengeUseCase.execute({
      challengeId: 'challenge1',
      userId: 'user1',
    })

    assert.isNotNull(abandonedParticipation)
    assert.equal(abandonedParticipation?.status, 'abandoned')
    assert.equal(abandonedParticipation?.workoutSessions.length, 1)
  })
})
