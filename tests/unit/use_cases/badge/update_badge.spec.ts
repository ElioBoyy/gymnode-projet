import { test } from '@japa/runner'
import { UpdateBadgeUseCase } from '../../../../app/application/use_cases/badge/update_badge.js'
import { BadgeRepository } from '../../../../app/domain/repositories/badge_repository.js'
import { Badge } from '../../../../app/domain/entities/badge.js'

test.group('UpdateBadgeUseCase', (group) => {
  let updateBadgeUseCase: UpdateBadgeUseCase
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

    updateBadgeUseCase = new UpdateBadgeUseCase(mockBadgeRepository, mockUserRepository)
  })

  test('should update badge successfully', async ({ assert }) => {
    const mockBadge = new Badge({
      id: '1',
      name: 'Original Badge',
      description: 'Original Description',
      icon: 'original-icon.png',
      rules: { challenges: 5 },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockBadgeRepository.findById = async () => mockBadge
    mockBadgeRepository.save = async (badge) => {}

    const result = await updateBadgeUseCase.execute({
      badgeId: '1',
      name: 'Updated Badge',
      description: 'Updated Description',
      icon: 'updated-icon.png',
      rules: { challenges: 10, workouts: 20 },
    })

    assert.equal(result.badge.name, 'Updated Badge')
    assert.equal(result.badge.description, 'Updated Description')
    assert.equal(result.badge.icon, 'updated-icon.png')
    assert.deepEqual(result.badge.rules, { challenges: 10, workouts: 20 })
  })

  test('should throw error when badge does not exist', async ({ assert }) => {
    mockBadgeRepository.findById = async () => null

    await assert.rejects(async () => {
      await updateBadgeUseCase.execute({
        badgeId: 'nonexistent',
        name: 'Updated Badge',
      })
    }, 'Badge not found')
  })

  test('should update only provided fields', async ({ assert }) => {
    const mockBadge = new Badge({
      id: '1',
      name: 'Original Badge',
      description: 'Original Description',
      icon: 'original-icon.png',
      rules: { challenges: 5 },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockBadgeRepository.findById = async () => mockBadge
    mockBadgeRepository.save = async (badge) => {}

    const result = await updateBadgeUseCase.execute({
      badgeId: '1',
      name: 'Updated Name Only',
    })

    assert.equal(result.badge.name, 'Updated Name Only')
    assert.equal(result.badge.description, 'Original Description')
    assert.equal(result.badge.icon, 'original-icon.png')
    assert.deepEqual(result.badge.rules, { challenges: 5 })
  })
})
