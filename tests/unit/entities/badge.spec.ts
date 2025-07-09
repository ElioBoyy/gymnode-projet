import { test } from '@japa/runner'
import { Badge, BadgeRule } from '../../../app/domain/entities/badge.js'

test.group('Badge Entity', (group) => {
  test('should create a badge with default values', async ({ assert }) => {
    const rules: BadgeRule[] = [
      {
        type: 'challenge_completion',
        condition: 'complete_challenge',
        value: 1,
      },
    ]

    const badge = new Badge({
      id: '1',
      name: 'First Challenge',
      description: 'Complete your first challenge',
      iconUrl: 'https://example.com/icon.png',
      rules,
    })

    assert.equal(badge.id, '1')
    assert.equal(badge.name, 'First Challenge')
    assert.equal(badge.description, 'Complete your first challenge')
    assert.equal(badge.iconUrl, 'https://example.com/icon.png')
    assert.deepEqual(badge.rules, rules)
    assert.isTrue(badge.isActive)
    assert.instanceOf(badge.createdAt, Date)
    assert.instanceOf(badge.updatedAt, Date)
  })

  test('should create a badge with custom values', async ({ assert }) => {
    const rules: BadgeRule[] = [
      {
        type: 'streak',
        condition: 'workout_streak',
        value: 7,
      },
    ]

    const createdAt = new Date('2023-01-01')
    const updatedAt = new Date('2023-01-02')

    const badge = new Badge({
      id: '2',
      name: 'Streak Master',
      description: 'Maintain a 7-day workout streak',
      iconUrl: 'https://example.com/streak.png',
      rules,
      isActive: false,
      createdAt,
      updatedAt,
    })

    assert.equal(badge.id, '2')
    assert.equal(badge.name, 'Streak Master')
    assert.isFalse(badge.isActive)
    assert.equal(badge.createdAt, createdAt)
    assert.equal(badge.updatedAt, updatedAt)
  })

  test('should deactivate a badge', async ({ assert }) => {
    const badge = new Badge({
      id: '1',
      name: 'Test Badge',
      description: 'Test description',
      iconUrl: 'https://example.com/icon.png',
      rules: [],
    })

    const deactivatedBadge = badge.deactivate()

    assert.isTrue(badge.isActive) // Original should remain unchanged
    assert.isFalse(deactivatedBadge.isActive)
    assert.isTrue(deactivatedBadge.updatedAt > badge.updatedAt)
  })

  test('should activate a badge', async ({ assert }) => {
    const badge = new Badge({
      id: '1',
      name: 'Test Badge',
      description: 'Test description',
      iconUrl: 'https://example.com/icon.png',
      rules: [],
      isActive: false,
    })

    const activatedBadge = badge.activate()

    assert.isFalse(badge.isActive) // Original should remain unchanged
    assert.isTrue(activatedBadge.isActive)
    assert.isTrue(activatedBadge.updatedAt > badge.updatedAt)
  })

  test('should update rules', async ({ assert }) => {
    const originalRules: BadgeRule[] = [
      {
        type: 'challenge_completion',
        condition: 'complete_challenge',
        value: 1,
      },
    ]

    const badge = new Badge({
      id: '1',
      name: 'Test Badge',
      description: 'Test description',
      iconUrl: 'https://example.com/icon.png',
      rules: originalRules,
    })

    const newRules: BadgeRule[] = [
      {
        type: 'streak',
        condition: 'workout_streak',
        value: 5,
      },
    ]

    const updatedBadge = badge.updateRules(newRules)

    assert.deepEqual(badge.rules, originalRules) // Original should remain unchanged
    assert.deepEqual(updatedBadge.rules, newRules)
    assert.isTrue(updatedBadge.updatedAt > badge.updatedAt)
  })
})
