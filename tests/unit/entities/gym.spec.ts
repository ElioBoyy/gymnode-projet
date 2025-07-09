import { test } from '@japa/runner'
import { Gym, GymStatus } from '../../../app/domain/entities/gym.js'

test.group('Gym Entity', (group) => {
  test('should create a gym with correct properties', ({ assert }) => {
    const gymData = {
      id: '12345',
      name: 'Test Gym',
      address: '123 Test Street',
      contact: 'test@gym.com',
      description: 'A test gym',
      capacity: 100,
      equipment: ['treadmill', 'weights'],
      activities: ['cardio', 'strength'],
      ownerId: 'owner123',
    }

    const gym = new Gym(gymData)

    assert.equal(gym.id, gymData.id)
    assert.equal(gym.name, gymData.name)
    assert.equal(gym.address, gymData.address)
    assert.equal(gym.contact, gymData.contact)
    assert.equal(gym.description, gymData.description)
    assert.equal(gym.capacity, gymData.capacity)
    assert.deepEqual(gym.equipment, gymData.equipment)
    assert.deepEqual(gym.activities, gymData.activities)
    assert.equal(gym.ownerId, gymData.ownerId)
    assert.equal(gym.status, GymStatus.PENDING)
    assert.instanceOf(gym.createdAt, Date)
    assert.instanceOf(gym.updatedAt, Date)
  })

  test('should approve gym', ({ assert }) => {
    const gym = new Gym({
      id: '12345',
      name: 'Test Gym',
      address: '123 Test Street',
      contact: 'test@gym.com',
      description: 'A test gym',
      capacity: 100,
      equipment: ['treadmill'],
      activities: ['cardio'],
      ownerId: 'owner123',
    })

    const approvedGym = gym.approve()

    assert.equal(approvedGym.status, GymStatus.APPROVED)
    assert.isTrue(approvedGym.updatedAt > gym.updatedAt)
  })

  test('should reject gym', ({ assert }) => {
    const gym = new Gym({
      id: '12345',
      name: 'Test Gym',
      address: '123 Test Street',
      contact: 'test@gym.com',
      description: 'A test gym',
      capacity: 100,
      equipment: ['treadmill'],
      activities: ['cardio'],
      ownerId: 'owner123',
    })

    const rejectedGym = gym.reject()

    assert.equal(rejectedGym.status, GymStatus.REJECTED)
    assert.isTrue(rejectedGym.updatedAt > gym.updatedAt)
  })

  test('should correctly identify gym status', ({ assert }) => {
    const pendingGym = new Gym({
      id: '1',
      name: 'Pending Gym',
      address: '123 Test Street',
      contact: 'test@gym.com',
      description: 'A test gym',
      capacity: 100,
      equipment: ['treadmill'],
      activities: ['cardio'],
      ownerId: 'owner123',
      status: GymStatus.PENDING,
    })

    const approvedGym = new Gym({
      id: '2',
      name: 'Approved Gym',
      address: '123 Test Street',
      contact: 'test@gym.com',
      description: 'A test gym',
      capacity: 100,
      equipment: ['treadmill'],
      activities: ['cardio'],
      ownerId: 'owner123',
      status: GymStatus.APPROVED,
    })

    assert.isTrue(pendingGym.isPending())
    assert.isFalse(pendingGym.isApproved())

    assert.isFalse(approvedGym.isPending())
    assert.isTrue(approvedGym.isApproved())
  })
})
