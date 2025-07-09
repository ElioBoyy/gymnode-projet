import { test } from '@japa/runner'
import { GetUserBadgesUseCase } from '../../../../app/application/use_cases/badge/get_user_badges.js'
import { UserBadgeRepository } from '../../../../app/domain/repositories/user_badge_repository.js'
import { UserBadge } from '../../../../app/domain/entities/user_badge.js'

test.group('GetUserBadgesUseCase', (group) => {
  let getUserBadgesUseCase: GetUserBadgesUseCase
  let mockUserBadgeRepository: UserBadgeRepository

  group.setup(async () => {
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

    const mockBadgeRepository = {
      findAll: async () => [],
      findById: async () => null,
      findByName: async () => null,
      findActive: async () => [],
      save: async () => {},
      update: async () => {},
      delete: async () => {},
      exists: async () => false,
    } as any

    getUserBadgesUseCase = new GetUserBadgesUseCase(mockBadgeRepository, mockUserBadgeRepository)
  })

  test('should return user badges', async ({ assert }) => {
    const mockUserBadges = [
      new UserBadge({
        id: '1',
        userId: 'user1',
        badgeId: 'badge1',
        earnedAt: new Date('2023-01-01'),
        challengeId: 'challenge1',
        metadata: { workouts: 5 },
      }),
      new UserBadge({
        id: '2',
        userId: 'user1',
        badgeId: 'badge2',
        earnedAt: new Date('2023-01-02'),
        challengeId: 'challenge2',
        metadata: { calories: 1000 },
      }),
    ]

    mockUserBadgeRepository.findByUserId = async (userId) => {
      return userId === 'user1' ? mockUserBadges : []
    }

    const result = await getUserBadgesUseCase.execute({
      userId: 'user1',
    })

    assert.equal(result.badges.length, 2)
    assert.equal(result.badges[0].name, 'Badge 1')
    assert.equal(result.badges[1].name, 'Badge 2')
  })

  test('should return empty array when user has no badges', async ({ assert }) => {
    mockUserBadgeRepository.findByUserId = async () => []

    const result = await getUserBadgesUseCase.execute({
      userId: 'user-without-badges',
    })

    assert.equal(result.userBadges.length, 0)
  })

  test('should return user badge details correctly', async ({ assert }) => {
    const mockUserBadge = new UserBadge({
      id: '1',
      userId: 'user1',
      badgeId: 'badge1',
      earnedAt: new Date('2023-01-01'),
      challengeId: 'challenge1',
      metadata: { workouts: 10, calories: 500 },
    })

    mockUserBadgeRepository.findByUserId = async () => [mockUserBadge]

    const result = await getUserBadgesUseCase.execute({
      userId: 'user1',
    })

    assert.equal(result.userBadges.length, 1)
    const userBadge = result.userBadges[0]
    assert.equal(userBadge.id, '1')
    assert.equal(userBadge.userId, 'user1')
    assert.equal(userBadge.badgeId, 'badge1')
    assert.equal(userBadge.challengeId, 'challenge1')
    assert.deepEqual(userBadge.metadata, { workouts: 10, calories: 500 })
  })

  test('should handle user badge without challenge', async ({ assert }) => {
    const mockUserBadge = new UserBadge({
      id: '1',
      userId: 'user1',
      badgeId: 'badge1',
      earnedAt: new Date('2023-01-01'),
      metadata: { workouts: 10 },
    })

    mockUserBadgeRepository.findByUserId = async () => [mockUserBadge]

    const result = await getUserBadgesUseCase.execute({
      userId: 'user1',
    })

    assert.equal(result.userBadges.length, 1)
    const userBadge = result.userBadges[0]
    assert.equal(userBadge.challengeId, undefined)
    assert.deepEqual(userBadge.metadata, { workouts: 10 })
  })

  test('should handle user badge without metadata', async ({ assert }) => {
    const mockUserBadge = new UserBadge({
      id: '1',
      userId: 'user1',
      badgeId: 'badge1',
      earnedAt: new Date('2023-01-01'),
      challengeId: 'challenge1',
    })

    mockUserBadgeRepository.findByUserId = async () => [mockUserBadge]

    const result = await getUserBadgesUseCase.execute({
      userId: 'user1',
    })

    assert.equal(result.userBadges.length, 1)
    const userBadge = result.userBadges[0]
    assert.equal(userBadge.metadata, undefined)
  })
})
