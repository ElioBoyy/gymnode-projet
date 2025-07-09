import { test } from '@japa/runner'
import { GetDashboardDataUseCase } from '../../../../app/application/use_cases/client/get_dashboard_data.js'
import { ChallengeParticipationRepository } from '../../../../app/domain/repositories/challenge_participation_repository.js'
import { UserBadgeRepository } from '../../../../app/domain/repositories/user_badge_repository.js'
import {
  ChallengeParticipation,
  ParticipationStatus,
} from '../../../../app/domain/entities/challenge_participation.js'
import { UserBadge } from '../../../../app/domain/entities/user_badge.js'

test.group('GetDashboardDataUseCase', (group) => {
  let getDashboardDataUseCase: GetDashboardDataUseCase
  let mockParticipationRepository: ChallengeParticipationRepository
  let mockUserBadgeRepository: UserBadgeRepository

  group.setup(async () => {
    mockParticipationRepository = {
      findById: async () => null,
      findByUserId: async () => [],
      findByChallengeId: async () => [],
      findByUserAndChallenge: async () => null,
      findByStatus: async () => [],
      findActiveByUserId: async () => [],
      findCompletedByUserId: async () => [],
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

    getDashboardDataUseCase = new GetDashboardDataUseCase(
      mockParticipationRepository,
      mockUserBadgeRepository
    )
  })

  test('should return dashboard data with statistics', async ({ assert }) => {
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
        joinedAt: new Date(),
        completedAt: new Date(),
        workoutSessions: [
          {
            id: '2',
            date: new Date(),
            duration: 45,
            caloriesBurned: 300,
            exercisesCompleted: ['Squats'],
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
        earnedAt: new Date(),
      }),
      new UserBadge({
        id: '2',
        userId: 'user1',
        badgeId: 'badge2',
        earnedAt: new Date(),
      }),
    ]

    mockParticipationRepository.findByUserId = async () => mockParticipations
    mockUserBadgeRepository.findByUserId = async () => mockUserBadges

    const result = await getDashboardDataUseCase.execute({
      userId: 'user1',
    })

    assert.equal(result.stats.activeChallenges, 1)
    assert.equal(result.stats.totalBadges, 2)
    assert.equal(result.stats.totalWorkouts, 2)
    assert.equal(result.stats.totalCalories, 500)
    assert.equal(result.activeChallenges.length, 1)
    assert.equal(result.recentBadges.length, 2)
    assert.equal(result.recentWorkouts.length, 2)
  })

  test('should handle user with no data', async ({ assert }) => {
    mockParticipationRepository.findByUserId = async () => []
    mockUserBadgeRepository.findByUserId = async () => []

    const result = await getDashboardDataUseCase.execute({
      userId: 'user1',
    })

    assert.equal(result.stats.activeChallenges, 0)
    assert.equal(result.stats.totalBadges, 0)
    assert.equal(result.stats.totalWorkouts, 0)
    assert.equal(result.stats.totalCalories, 0)
    assert.equal(result.activeChallenges.length, 0)
    assert.equal(result.recentBadges.length, 0)
    assert.equal(result.recentWorkouts.length, 0)
  })

  test('should limit recent participations and badges', async ({ assert }) => {
    const mockParticipations = Array.from(
      { length: 10 },
      (_, i) =>
        new ChallengeParticipation({
          id: `${i + 1}`,
          userId: 'user1',
          challengeId: `challenge${i + 1}`,
          status: ParticipationStatus.ACTIVE,
          joinedAt: new Date(),
          workoutSessions: [],
        })
    )

    const mockUserBadges = Array.from(
      { length: 10 },
      (_, i) =>
        new UserBadge({
          id: `${i + 1}`,
          userId: 'user1',
          badgeId: `badge${i + 1}`,
          earnedAt: new Date(),
        })
    )

    mockParticipationRepository.findByUserId = async () => mockParticipations
    mockUserBadgeRepository.findByUserId = async () => mockUserBadges

    const result = await getDashboardDataUseCase.execute({
      userId: 'user1',
    })

    assert.equal(result.stats.activeChallenges, 10)
    assert.equal(result.stats.totalBadges, 10)
    assert.equal(result.activeChallenges.length, 3) // Limited to 3
    assert.equal(result.recentBadges.length, 3) // Limited to 3
  })
})
