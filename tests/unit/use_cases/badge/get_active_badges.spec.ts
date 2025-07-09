import { test } from '@japa/runner'
import { GetActiveBadgesUseCase } from '../../../../app/application/use_cases/badge/get_active_badges.js'
import { BadgeRepository } from '../../../../app/domain/repositories/badge_repository.js'
import { Badge } from '../../../../app/domain/entities/badge.js'

test.group('GetActiveBadgesUseCase', (group) => {
  let getActiveBadgesUseCase: GetActiveBadgesUseCase
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

    getActiveBadgesUseCase = new GetActiveBadgesUseCase(mockBadgeRepository)
  })

  test('should return active badges', async ({ assert }) => {
    const mockBadges = [
      new Badge({
        id: '1',
        name: 'Active Badge 1',
        description: 'Description 1',
        icon: 'icon1.png',
        rules: { challenges: 5 },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new Badge({
        id: '2',
        name: 'Active Badge 2',
        description: 'Description 2',
        icon: 'icon2.png',
        rules: { workouts: 10 },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]

    mockBadgeRepository.findActive = async () => mockBadges

    const result = await getActiveBadgesUseCase.execute()

    assert.equal(result.badges.length, 2)
    assert.equal(result.badges[0].name, 'Active Badge 1')
    assert.equal(result.badges[1].name, 'Active Badge 2')
  })

  test('should return empty array when no active badges exist', async ({ assert }) => {
    mockBadgeRepository.findActive = async () => []

    const result = await getActiveBadgesUseCase.execute()

    assert.equal(result.badges.length, 0)
  })

  test('should return badge details correctly', async ({ assert }) => {
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

    mockBadgeRepository.findActive = async () => [mockBadge]

    const result = await getActiveBadgesUseCase.execute()

    assert.equal(result.badges.length, 1)
    const badge = result.badges[0]
    assert.equal(badge.id, '1')
    assert.equal(badge.name, 'Test Badge')
    assert.equal(badge.description, 'Test Description')
  })
})
