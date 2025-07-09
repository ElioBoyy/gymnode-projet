import { test } from '@japa/runner'
import { GetUserStatsUseCase } from '../../../../app/application/use_cases/client/get_user_stats.js'
import { ChallengeParticipationRepository } from '../../../../app/domain/repositories/challenge_participation_repository.js'
import { UserBadgeRepository } from '../../../../app/domain/repositories/user_badge_repository.js'
import {
  ChallengeParticipation,
  ParticipationStatus,
} from '../../../../app/domain/entities/challenge_participation.js'
import { UserBadge } from '../../../../app/domain/entities/user_badge.js'

test.group('GetUserStatsUseCase', (group) => {
  let getUserStatsUseCase: GetUserStatsUseCase
  let mockParticipationRepository: ChallengeParticipationRepository
  let mockUserBadgeRepository: UserBadgeRepository

  group.setup(async () => {
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

    mockUserBadgeRepository = {
      findById: async () => null,
      findByUserId: async () => [],
      findByBadgeId: async () => [],
      findByUserAndBadge: async () => null,
      findByChallengeId: async () => [],
      save: async () => {},
      delete: async () => {},
      exists: async () => false,
    } as UserBadgeRepository

    getUserStatsUseCase = new GetUserStatsUseCase(
      mockParticipationRepository,
      mockUserBadgeRepository
    )
  })

  test('should return comprehensive user statistics', async ({ assert }) => {
    const mockParticipations = [
      new ChallengeParticipation({
        id: '1',
        userId: 'user1',
        challengeId: 'challenge1',
        status: ParticipationStatus.COMPLETED,
        joinedAt: new Date('2023-01-01'),
        completedAt: new Date('2023-02-01'),
        workoutSessions: [
          {
            id: '1',
            date: new Date('2023-01-05'),
            duration: 30,
            caloriesBurned: 200,
            exercisesCompleted: ['Push-ups'],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '2',
            date: new Date('2023-01-10'),
            duration: 45,
            caloriesBurned: 300,
            exercisesCompleted: ['Squats'],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }),
      new ChallengeParticipation({
        id: '2',
        userId: 'user1',
        challengeId: 'challenge2',
        status: ParticipationStatus.ACTIVE,
        joinedAt: new Date('2023-02-01'),
        workoutSessions: [
          {
            id: '3',
            date: new Date('2023-02-05'),
            duration: 60,
            caloriesBurned: 400,
            exercisesCompleted: ['Running'],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }),
    ]

    const mockUserBadges = [
      new UserBadge({
        id: '1',
        userId: 'user1',
        badgeId: 'badge1',
        earnedAt: new Date('2023-01-15'),
        challengeId: 'challenge1',
      }),
      new UserBadge({
        id: '2',
        userId: 'user1',
        badgeId: 'badge2',
        earnedAt: new Date('2023-02-10'),
      }),
    ]

    mockParticipationRepository.findByUserId = async () => mockParticipations
    mockUserBadgeRepository.findByUserId = async () => mockUserBadges

    const result = await getUserStatsUseCase.execute({
      userId: 'user1',
    })

    assert.equal(result.totalChallenges, 2)
    assert.equal(result.completedChallenges, 1)
    assert.equal(result.activeChallenges, 1)
    assert.equal(result.totalWorkouts, 3)
    assert.equal(result.totalDuration, 135)
    assert.equal(result.totalCaloriesBurned, 900)
    assert.equal(result.totalBadges, 2)
    assert.equal(result.challengeBadges, 1)
    assert.equal(result.averageWorkoutDuration, 45)
  })

  test('should handle user with no activity', async ({ assert }) => {
    mockParticipationRepository.findByUserId = async () => []
    mockUserBadgeRepository.findByUserId = async () => []

    const result = await getUserStatsUseCase.execute({
      userId: 'user1',
    })

    assert.equal(result.totalChallenges, 0)
    assert.equal(result.completedChallenges, 0)
    assert.equal(result.activeChallenges, 0)
    assert.equal(result.totalWorkouts, 0)
    assert.equal(result.totalDuration, 0)
    assert.equal(result.totalCaloriesBurned, 0)
    assert.equal(result.totalBadges, 0)
    assert.equal(result.challengeBadges, 0)
    assert.equal(result.averageWorkoutDuration, 0)
  })

  test('should calculate average workout duration correctly', async ({ assert }) => {
    const mockParticipations = [
      new ChallengeParticipation({
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
          },
          {
            id: '2',
            date: new Date(),
            duration: 60,
            caloriesBurned: 400,
            exercisesCompleted: ['Running'],
          },
        ],
      }),
    ]

    mockParticipationRepository.findByUserId = async () => mockParticipations
    mockUserBadgeRepository.findByUserId = async () => []

    const result = await getUserStatsUseCase.execute({
      userId: 'user1',
    })

    assert.equal(result.totalWorkouts, 2)
    assert.equal(result.totalDuration, 90)
    assert.equal(result.averageWorkoutDuration, 45)
  })
})
