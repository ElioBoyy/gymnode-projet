import { test } from '@japa/runner'
import { GetGymByIdUseCase } from '../../../../app/application/use_cases/gym/get_gym_by_id.js'
import { GymRepository } from '../../../../app/domain/repositories/gym_repository.js'
import { Gym, GymStatus } from '../../../../app/domain/entities/gym.js'

test.group('GetGymByIdUseCase', (group) => {
  let getGymByIdUseCase: GetGymByIdUseCase
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

    getGymByIdUseCase = new GetGymByIdUseCase(mockGymRepository)
  })

  test('should return gym details when gym exists and is approved', async ({ assert }) => {
    const mockGym = new Gym({
      id: '1',
      name: 'Test Gym',
      address: '123 Test Street',
      contact: 'test@gym.com',
      description: 'Test Description',
      capacity: 150,
      equipment: ['Treadmill', 'Weights'],
      activities: ['Cardio', 'Strength'],
      status: GymStatus.APPROVED,
      ownerId: 'owner1',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
    })

    mockGymRepository.findById = async (id) => {
      return id === '1' ? mockGym : null
    }

    const result = await getGymByIdUseCase.execute({
      gymId: '1',
    })

    assert.equal(result.gym.id, '1')
    assert.equal(result.gym.name, 'Test Gym')
    assert.equal(result.gym.address, '123 Test Street')
    assert.equal(result.gym.contact, 'test@gym.com')
    assert.equal(result.gym.description, 'Test Description')
    assert.equal(result.gym.capacity, 150)
    assert.deepEqual(result.gym.equipment, ['Treadmill', 'Weights'])
    assert.deepEqual(result.gym.activities, ['Cardio', 'Strength'])
    assert.equal(result.gym.status, GymStatus.APPROVED)
    assert.equal(result.gym.ownerId, 'owner1')
  })

  test('should throw error when gym does not exist', async ({ assert }) => {
    mockGymRepository.findById = async () => null

    await assert.rejects(async () => {
      await getGymByIdUseCase.execute({
        gymId: 'nonexistent',
      })
    }, 'Gym not found')
  })

  test('should throw error when gym is not approved and no private access', async ({ assert }) => {
    const mockGym = new Gym({
      id: '1',
      name: 'Pending Gym',
      address: '123 Test Street',
      contact: 'test@gym.com',
      description: 'Test Description',
      capacity: 150,
      equipment: ['Treadmill'],
      activities: ['Cardio'],
      status: GymStatus.PENDING,
      ownerId: 'owner1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockGymRepository.findById = async () => mockGym

    await assert.rejects(async () => {
      await getGymByIdUseCase.execute({
        gymId: '1',
        includePrivate: false,
      })
    }, 'Gym not found')
  })

  test('should return pending gym when private access is allowed', async ({ assert }) => {
    const mockGym = new Gym({
      id: '1',
      name: 'Pending Gym',
      address: '123 Test Street',
      contact: 'test@gym.com',
      description: 'Test Description',
      capacity: 150,
      equipment: ['Treadmill'],
      activities: ['Cardio'],
      status: GymStatus.PENDING,
      ownerId: 'owner1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockGymRepository.findById = async () => mockGym

    const result = await getGymByIdUseCase.execute({
      gymId: '1',
      includePrivate: true,
    })

    assert.equal(result.gym.id, '1')
    assert.equal(result.gym.status, GymStatus.PENDING)
    assert.equal(result.gym.name, 'Pending Gym')
  })

  test('should return rejected gym when private access is allowed', async ({ assert }) => {
    const mockGym = new Gym({
      id: '1',
      name: 'Rejected Gym',
      address: '123 Test Street',
      contact: 'test@gym.com',
      description: 'Test Description',
      capacity: 150,
      equipment: ['Treadmill'],
      activities: ['Cardio'],
      status: GymStatus.REJECTED,
      ownerId: 'owner1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockGymRepository.findById = async () => mockGym

    const result = await getGymByIdUseCase.execute({
      gymId: '1',
      includePrivate: true,
    })

    assert.equal(result.gym.id, '1')
    assert.equal(result.gym.status, GymStatus.REJECTED)
    assert.equal(result.gym.name, 'Rejected Gym')
  })

  test('should handle gym with minimal information', async ({ assert }) => {
    const mockGym = new Gym({
      id: '1',
      name: 'Simple Gym',
      address: '123 Street',
      contact: 'contact@gym.com',
      description: 'Simple Description',
      capacity: 50,
      equipment: [],
      activities: [],
      status: GymStatus.APPROVED,
      ownerId: 'owner1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockGymRepository.findById = async () => mockGym

    const result = await getGymByIdUseCase.execute({
      gymId: '1',
    })

    assert.equal(result.gym.id, '1')
    assert.equal(result.gym.name, 'Simple Gym')
    assert.deepEqual(result.gym.equipment, [])
    assert.deepEqual(result.gym.activities, [])
    assert.equal(result.gym.capacity, 50)
  })
})
