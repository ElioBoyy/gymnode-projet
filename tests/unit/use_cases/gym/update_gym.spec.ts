import { test } from '@japa/runner'
import { UpdateGymUseCase } from '../../../../app/application/use_cases/gym/update_gym.js'
import { GymRepository } from '../../../../app/domain/repositories/gym_repository.js'
import { Gym, GymStatus } from '../../../../app/domain/entities/gym.js'

test.group('UpdateGymUseCase', (group) => {
  let updateGymUseCase: UpdateGymUseCase
  let mockGymRepository: GymRepository

  group.setup(async () => {
    mockGymRepository = {
      findAll: async () => [],
      findById: async () => null,
      findByOwnerId: async () => [],
      findByStatus: async () => [],
      save: async () => {},
      update: async () => {},
      delete: async () => {},
      exists: async () => false,
    } as GymRepository

    updateGymUseCase = new UpdateGymUseCase(mockGymRepository)
  })

  test('should update gym successfully when user is owner', async ({ assert }) => {
    const mockGym = new Gym({
      id: '1',
      name: 'Original Gym',
      address: 'Original Address',
      contact: 'original@gym.com',
      description: 'Original Description',
      capacity: 100,
      equipment: ['Original Equipment'],
      activities: ['Original Activity'],
      status: GymStatus.APPROVED,
      ownerId: 'owner1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockGymRepository.findById = async () => mockGym
    mockGymRepository.save = async (gym) => {
      // Simulate saving the gym
    }

    const result = await updateGymUseCase.execute({
      gymId: '1',
      ownerId: 'owner1',
      name: 'Updated Gym',
      address: 'Updated Address',
      contact: 'updated@gym.com',
      description: 'Updated Description',
      capacity: 150,
      equipment: ['Updated Equipment'],
      activities: ['Updated Activity'],
    })

    assert.equal(result.gym.name, 'Updated Gym')
    assert.equal(result.gym.address, 'Updated Address')
    assert.equal(result.gym.contact, 'updated@gym.com')
    assert.equal(result.gym.description, 'Updated Description')
    assert.equal(result.gym.capacity, 150)
    assert.deepEqual(result.gym.equipment, ['Updated Equipment'])
    assert.deepEqual(result.gym.activities, ['Updated Activity'])
    assert.equal(result.gym.id, '1')
    assert.equal(result.gym.ownerId, 'owner1')
  })

  test('should throw error when gym does not exist', async ({ assert }) => {
    mockGymRepository.findById = async () => null

    await assert.rejects(async () => {
      await updateGymUseCase.execute({
        gymId: 'nonexistent',
        ownerId: 'owner1',
        name: 'Updated Gym',
      })
    }, 'Gym not found')
  })

  test('should throw error when user is not the owner', async ({ assert }) => {
    const mockGym = new Gym({
      id: '1',
      name: 'Original Gym',
      address: 'Original Address',
      contact: 'original@gym.com',
      description: 'Original Description',
      capacity: 100,
      equipment: ['Equipment'],
      activities: ['Activity'],
      status: GymStatus.APPROVED,
      ownerId: 'owner1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockGymRepository.findById = async () => mockGym

    await assert.rejects(async () => {
      await updateGymUseCase.execute({
        gymId: '1',
        ownerId: 'owner2', // Different owner
        name: 'Updated Gym',
      })
    }, 'Only the owner can update this gym')
  })

  test('should update only provided fields', async ({ assert }) => {
    const mockGym = new Gym({
      id: '1',
      name: 'Original Gym',
      address: 'Original Address',
      contact: 'original@gym.com',
      description: 'Original Description',
      capacity: 100,
      equipment: ['Original Equipment'],
      activities: ['Original Activity'],
      status: GymStatus.APPROVED,
      ownerId: 'owner1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockGymRepository.findById = async () => mockGym
    mockGymRepository.save = async (gym) => {}

    const result = await updateGymUseCase.execute({
      gymId: '1',
      ownerId: 'owner1',
      name: 'Updated Name Only',
    })

    assert.equal(result.gym.name, 'Updated Name Only')
    assert.equal(result.gym.address, 'Original Address')
    assert.equal(result.gym.contact, 'original@gym.com')
    assert.equal(result.gym.description, 'Original Description')
    assert.equal(result.gym.capacity, 100)
    assert.deepEqual(result.gym.equipment, ['Original Equipment'])
    assert.deepEqual(result.gym.activities, ['Original Activity'])
  })

  test('should update capacity when provided', async ({ assert }) => {
    const mockGym = new Gym({
      id: '1',
      name: 'Test Gym',
      address: 'Test Address',
      contact: 'test@gym.com',
      description: 'Test Description',
      capacity: 100,
      equipment: ['Equipment'],
      activities: ['Activity'],
      status: GymStatus.APPROVED,
      ownerId: 'owner1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockGymRepository.findById = async () => mockGym
    mockGymRepository.save = async (gym) => {}

    const result = await updateGymUseCase.execute({
      gymId: '1',
      ownerId: 'owner1',
      capacity: 200,
    })

    assert.equal(result.gym.capacity, 200)
    assert.equal(result.gym.name, 'Test Gym')
  })

  test('should update equipment and activities arrays', async ({ assert }) => {
    const mockGym = new Gym({
      id: '1',
      name: 'Test Gym',
      address: 'Test Address',
      contact: 'test@gym.com',
      description: 'Test Description',
      capacity: 100,
      equipment: ['Old Equipment'],
      activities: ['Old Activity'],
      status: GymStatus.APPROVED,
      ownerId: 'owner1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockGymRepository.findById = async () => mockGym
    mockGymRepository.save = async (gym) => {}

    const result = await updateGymUseCase.execute({
      gymId: '1',
      ownerId: 'owner1',
      equipment: ['New Equipment 1', 'New Equipment 2'],
      activities: ['New Activity 1', 'New Activity 2'],
    })

    assert.deepEqual(result.gym.equipment, ['New Equipment 1', 'New Equipment 2'])
    assert.deepEqual(result.gym.activities, ['New Activity 1', 'New Activity 2'])
  })

  test('should handle empty equipment and activities arrays', async ({ assert }) => {
    const mockGym = new Gym({
      id: '1',
      name: 'Test Gym',
      address: 'Test Address',
      contact: 'test@gym.com',
      description: 'Test Description',
      capacity: 100,
      equipment: ['Equipment'],
      activities: ['Activity'],
      status: GymStatus.APPROVED,
      ownerId: 'owner1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockGymRepository.findById = async () => mockGym
    mockGymRepository.save = async (gym) => {}

    const result = await updateGymUseCase.execute({
      gymId: '1',
      ownerId: 'owner1',
      equipment: [],
      activities: [],
    })

    assert.deepEqual(result.gym.equipment, [])
    assert.deepEqual(result.gym.activities, [])
  })
})
