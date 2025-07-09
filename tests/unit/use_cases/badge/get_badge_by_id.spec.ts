import { test } from '@japa/runner'
import { GetBadgeByIdUseCase } from '../../../../app/application/use_cases/badge/get_badge_by_id.js'
import { BadgeRepository } from '../../../../app/domain/repositories/badge_repository.js'
import { Badge } from '../../../../app/domain/entities/badge.js'

test.group('GetBadgeByIdUseCase', (group) => {
  let getBadgeByIdUseCase: GetBadgeByIdUseCase
  let mockBadgeRepository: BadgeRepository

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

    getBadgeByIdUseCase = new GetBadgeByIdUseCase(mockBadgeRepository)
  })

  test('should return badge details when badge exists', async ({ assert }) => {
    const mockBadge = new Badge({
      id: '1',
      name: 'Test Badge',
      description: 'Test Description',
      icon: 'test-icon.png',
      rules: { challenges: 5, workouts: 10 },
      isActive: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
    })

    mockBadgeRepository.findById = async (id) => {
      return id === '1' ? mockBadge : null
    }

    const result = await getBadgeByIdUseCase.execute({
      badgeId: '1',
    })

    assert.equal(result.badge.id, '1')
    assert.equal(result.badge.name, 'Test Badge')
    assert.equal(result.badge.description, 'Test Description')
    assert.equal(result.badge.icon, 'test-icon.png')
    assert.deepEqual(result.badge.rules, { challenges: 5, workouts: 10 })
    assert.isTrue(result.badge.isActive)
  })

  test('should throw error when badge does not exist', async ({ assert }) => {
    mockBadgeRepository.findById = async () => null

    await assert.rejects(async () => {
      await getBadgeByIdUseCase.execute({
        badgeId: 'nonexistent',
      })
    }, 'Badge not found')
  })

  test('should return inactive badge details', async ({ assert }) => {
    const mockBadge = new Badge({
      id: '1',
      name: 'Inactive Badge',
      description: 'Inactive Description',
      icon: 'inactive-icon.png',
      rules: { challenges: 3 },
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockBadgeRepository.findById = async () => mockBadge

    const result = await getBadgeByIdUseCase.execute({
      badgeId: '1',
    })

    assert.equal(result.badge.name, 'Inactive Badge')
    assert.isFalse(result.badge.isActive)
  })

  test('should handle badge with complex rules', async ({ assert }) => {
    const mockBadge = new Badge({
      id: '1',
      name: 'Complex Badge',
      description: 'Complex Description',
      icon: 'complex-icon.png',
      rules: {
        challenges: 10,
        workouts: 50,
        calories: 5000,
        streak: 7,
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockBadgeRepository.findById = async () => mockBadge

    const result = await getBadgeByIdUseCase.execute({
      badgeId: '1',
    })

    assert.equal(result.badge.name, 'Complex Badge')
    assert.deepEqual(result.badge.rules, {
      challenges: 10,
      workouts: 50,
      calories: 5000,
      streak: 7,
    })
  })
})
