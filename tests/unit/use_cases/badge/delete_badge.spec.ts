import { test } from '@japa/runner'
import { DeleteBadgeUseCase } from '../../../../app/application/use_cases/badge/delete_badge.js'
import { BadgeRepository } from '../../../../app/domain/repositories/badge_repository.js'
import { UserBadgeRepository } from '../../../../app/domain/repositories/user_badge_repository.js'
import { Badge } from '../../../../app/domain/entities/badge.js'

test.group('DeleteBadgeUseCase', (group) => {
  let deleteBadgeUseCase: DeleteBadgeUseCase
  let mockBadgeRepository: BadgeRepository
  let mockUserBadgeRepository: UserBadgeRepository

  group.setup(async () => {
    mockBadgeRepository = {
      findAll: async () => [],
      findById: async () => null,
      findByName: async () => null,
      findActive: async () => [],
      save: async () => {},
      update: async () => {},
      delete: async () => {},
      exists: async () => false,
    } as BadgeRepository

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

    const mockUserRepository = {
      findAll: async () => [],
      findById: async () => null,
      findByEmail: async () => null,
      findByRole: async () => [],
      save: async () => {},
      update: async () => {},
      delete: async () => {},
      exists: async () => false,
    } as any

    deleteBadgeUseCase = new DeleteBadgeUseCase(
      mockBadgeRepository,
      mockUserRepository,
      mockUserBadgeRepository
    )
  })

  test('should delete badge successfully when no users have earned it', async ({ assert }) => {
    const mockBadge = new Badge({
      id: '1',
      name: 'Test Badge',
      description: 'Test Description',
      icon: 'test-icon.png',
      rules: { challenges: 5 },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockBadgeRepository.findById = async () => mockBadge
    mockUserBadgeRepository.findByBadgeId = async () => []
    mockBadgeRepository.delete = async (badgeId) => {
      assert.equal(badgeId, '1')
    }

    await deleteBadgeUseCase.execute({
      badgeId: '1',
    })
  })

  test('should throw error when badge does not exist', async ({ assert }) => {
    mockBadgeRepository.findById = async () => null

    await assert.rejects(async () => {
      await deleteBadgeUseCase.execute({
        badgeId: 'nonexistent',
      })
    }, 'Badge not found')
  })

  test('should throw error when users have earned the badge', async ({ assert }) => {
    const mockBadge = new Badge({
      id: '1',
      name: 'Test Badge',
      description: 'Test Description',
      icon: 'test-icon.png',
      rules: { challenges: 5 },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockBadgeRepository.findById = async () => mockBadge
    mockUserBadgeRepository.findByBadgeId = async () =>
      [{ id: '1', userId: 'user1', badgeId: '1' }] as any

    await assert.rejects(async () => {
      await deleteBadgeUseCase.execute({
        badgeId: '1',
      })
    }, 'Cannot delete badge that has been earned by users')
  })
})
