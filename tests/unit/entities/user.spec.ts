import { test } from '@japa/runner'
import { User, UserRole } from '../../../app/domain/entities/user.js'

test.group('User Entity', (group) => {
  test('should create a user with correct properties', ({ assert }) => {
    const userData = {
      id: '12345',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: UserRole.CLIENT,
    }

    const user = new User(userData)

    assert.equal(user.id, userData.id)
    assert.equal(user.email, userData.email)
    assert.equal(user.password, userData.password)
    assert.equal(user.role, userData.role)
    assert.isTrue(user.isActive)
    assert.instanceOf(user.createdAt, Date)
    assert.instanceOf(user.updatedAt, Date)
  })

  test('should create inactive user when specified', ({ assert }) => {
    const userData = {
      id: '12345',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: UserRole.CLIENT,
      isActive: false,
    }

    const user = new User(userData)

    assert.isFalse(user.isActive)
  })

  test('should deactivate user', ({ assert }) => {
    const user = new User({
      id: '12345',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: UserRole.CLIENT,
    })

    const deactivatedUser = user.deactivate()

    assert.isFalse(deactivatedUser.isActive)
    assert.isTrue(deactivatedUser.updatedAt > user.updatedAt)
  })

  test('should correctly identify user roles', ({ assert }) => {
    const superAdmin = new User({
      id: '1',
      email: 'admin@example.com',
      password: 'hashedpassword',
      role: UserRole.SUPER_ADMIN,
    })

    const gymOwner = new User({
      id: '2',
      email: 'owner@example.com',
      password: 'hashedpassword',
      role: UserRole.GYM_OWNER,
    })

    const client = new User({
      id: '3',
      email: 'client@example.com',
      password: 'hashedpassword',
      role: UserRole.CLIENT,
    })

    assert.isTrue(superAdmin.isSuperAdmin())
    assert.isFalse(superAdmin.isGymOwner())
    assert.isFalse(superAdmin.isClient())

    assert.isFalse(gymOwner.isSuperAdmin())
    assert.isTrue(gymOwner.isGymOwner())
    assert.isFalse(gymOwner.isClient())

    assert.isFalse(client.isSuperAdmin())
    assert.isFalse(client.isGymOwner())
    assert.isTrue(client.isClient())
  })
})
