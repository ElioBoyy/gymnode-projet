import { test } from '@japa/runner'
import { UserBadge } from '../../../app/domain/entities/user_badge.js'

test.group('UserBadge Entity', (group) => {
  test('should create a user badge with default values', async ({ assert }) => {
    const userBadge = new UserBadge({
      id: '1',
      userId: 'user-1',
      badgeId: 'badge-1',
    })

    assert.equal(userBadge.id, '1')
    assert.equal(userBadge.userId, 'user-1')
    assert.equal(userBadge.badgeId, 'badge-1')
    assert.instanceOf(userBadge.earnedAt, Date)
    assert.isUndefined(userBadge.relatedChallengeId)
    assert.isUndefined(userBadge.metadata)
  })

  test('should create a user badge with custom values', async ({ assert }) => {
    const earnedAt = new Date('2023-01-15')
    const metadata = { score: 100, timeSpent: 3600 }

    const userBadge = new UserBadge({
      id: '2',
      userId: 'user-2',
      badgeId: 'badge-2',
      earnedAt,
      relatedChallengeId: 'challenge-1',
      metadata,
    })

    assert.equal(userBadge.id, '2')
    assert.equal(userBadge.userId, 'user-2')
    assert.equal(userBadge.badgeId, 'badge-2')
    assert.equal(userBadge.earnedAt, earnedAt)
    assert.equal(userBadge.relatedChallengeId, 'challenge-1')
    assert.deepEqual(userBadge.metadata, metadata)
  })

  test('should check if badge is related to challenge', async ({ assert }) => {
    const userBadgeWithChallenge = new UserBadge({
      id: '1',
      userId: 'user-1',
      badgeId: 'badge-1',
      relatedChallengeId: 'challenge-1',
    })

    const userBadgeWithoutChallenge = new UserBadge({
      id: '2',
      userId: 'user-2',
      badgeId: 'badge-2',
    })

    assert.isTrue(userBadgeWithChallenge.isRelatedToChallenge())
    assert.isFalse(userBadgeWithoutChallenge.isRelatedToChallenge())
  })

  test('should check if badge has metadata', async ({ assert }) => {
    const userBadgeWithMetadata = new UserBadge({
      id: '1',
      userId: 'user-1',
      badgeId: 'badge-1',
      metadata: { score: 95 },
    })

    const userBadgeWithEmptyMetadata = new UserBadge({
      id: '2',
      userId: 'user-2',
      badgeId: 'badge-2',
      metadata: {},
    })

    const userBadgeWithoutMetadata = new UserBadge({
      id: '3',
      userId: 'user-3',
      badgeId: 'badge-3',
    })

    assert.isTrue(userBadgeWithMetadata.hasMetadata())
    assert.isFalse(userBadgeWithEmptyMetadata.hasMetadata())
    assert.isFalse(userBadgeWithoutMetadata.hasMetadata())
  })
})
