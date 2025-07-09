import { test } from '@japa/runner'
import { GetGymByOwnerUseCase } from '../../../../app/application/use_cases/gym/get_gym_by_owner.js'
import { GymRepository } from '../../../../app/domain/repositories/gym_repository.js'
import { Gym, GymStatus } from '../../../../app/domain/entities/gym.js'

test.group('GetGymByOwnerUseCase', (group) => {
  let getGymByOwnerUseCase: GetGymByOwnerUseCase
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

    getGymByOwnerUseCase = new GetGymByOwnerUseCase(mockGymRepository)
  })

  test('should return gyms owned by the specified owner', async ({ assert }) => {
    const mockGyms = [
      new Gym({
        id: '1',
        name: 'Gym 1',
        address: '123 Street',
        contact: 'contact1@gym.com',
        description: 'Description 1',
        capacity: 100,
        equipment: ['Equipment 1'],
        activities: ['Activity 1'],
        status: GymStatus.APPROVED,
        ownerId: 'owner1',
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-02'),
      }),
      new Gym({
        id: '2',
        name: 'Gym 2',
        address: '456 Street',
        contact: 'contact2@gym.com',
        description: 'Description 2',
        capacity: 150,
        equipment: ['Equipment 2'],
        activities: ['Activity 2'],
        status: GymStatus.PENDING,
        ownerId: 'owner1',
        createdAt: new Date('2023-01-03'),
        updatedAt: new Date('2023-01-04'),
      }),
    ]

    mockGymRepository.findByOwnerId = async (ownerId) => {
      return ownerId === 'owner1' ? mockGyms : []
    }

    const result = await getGymByOwnerUseCase.execute({
      ownerId: 'owner1',
    })

    assert.equal(result.gyms.length, 2)
    assert.equal(result.gyms[0].id, '1')
    assert.equal(result.gyms[0].name, 'Gym 1')
    assert.equal(result.gyms[0].status, GymStatus.APPROVED)
    assert.equal(result.gyms[1].id, '2')
    assert.equal(result.gyms[1].name, 'Gym 2')
    assert.equal(result.gyms[1].status, GymStatus.PENDING)
  })

  test('should return empty array when owner has no gyms', async ({ assert }) => {
    mockGymRepository.findByOwnerId = async () => []

    const result = await getGymByOwnerUseCase.execute({
      ownerId: 'owner-without-gyms',
    })

    assert.equal(result.gyms.length, 0)
  })

  test('should return all gym details for owner', async ({ assert }) => {
    const mockGym = new Gym({
      id: '1',
      name: 'Test Gym',
      address: '123 Test Street',
      contact: 'test@gym.com',
      description: 'Test Description',
      capacity: 200,
      equipment: ['Treadmill', 'Weights', 'Bikes'],
      activities: ['Cardio', 'Strength', 'Classes'],
      status: GymStatus.APPROVED,
      ownerId: 'owner1',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
    })

    mockGymRepository.findByOwnerId = async () => [mockGym]

    const result = await getGymByOwnerUseCase.execute({
      ownerId: 'owner1',
    })

    assert.equal(result.gyms.length, 1)
    const gym = result.gyms[0]
    assert.equal(gym.id, '1')
    assert.equal(gym.name, 'Test Gym')
    assert.equal(gym.address, '123 Test Street')
    assert.equal(gym.contact, 'test@gym.com')
    assert.equal(gym.description, 'Test Description')
    assert.equal(gym.capacity, 200)
    assert.deepEqual(gym.equipment, ['Treadmill', 'Weights', 'Bikes'])
    assert.deepEqual(gym.activities, ['Cardio', 'Strength', 'Classes'])
    assert.equal(gym.status, GymStatus.APPROVED)
    assert.equal(gym.ownerId, 'owner1')
  })

  test('should return gyms with different statuses for owner', async ({ assert }) => {
    const mockGyms = [
      new Gym({
        id: '1',
        name: 'Approved Gym',
        address: '123 Street',
        contact: 'contact@gym.com',
        description: 'Description',
        capacity: 100,
        equipment: ['Equipment'],
        activities: ['Activity'],
        status: GymStatus.APPROVED,
        ownerId: 'owner1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new Gym({
        id: '2',
        name: 'Pending Gym',
        address: '456 Street',
        contact: 'contact@gym.com',
        description: 'Description',
        capacity: 100,
        equipment: ['Equipment'],
        activities: ['Activity'],
        status: GymStatus.PENDING,
        ownerId: 'owner1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new Gym({
        id: '3',
        name: 'Rejected Gym',
        address: '789 Street',
        contact: 'contact@gym.com',
        description: 'Description',
        capacity: 100,
        equipment: ['Equipment'],
        activities: ['Activity'],
        status: GymStatus.REJECTED,
        ownerId: 'owner1',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]

    mockGymRepository.findByOwnerId = async () => mockGyms

    const result = await getGymByOwnerUseCase.execute({
      ownerId: 'owner1',
    })

    assert.equal(result.gyms.length, 3)
    assert.equal(result.gyms[0].status, GymStatus.APPROVED)
    assert.equal(result.gyms[1].status, GymStatus.PENDING)
    assert.equal(result.gyms[2].status, GymStatus.REJECTED)
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

    mockGymRepository.findByOwnerId = async () => [mockGym]

    const result = await getGymByOwnerUseCase.execute({
      ownerId: 'owner1',
    })

    assert.equal(result.gyms.length, 1)
    const gym = result.gyms[0]
    assert.equal(gym.name, 'Simple Gym')
    assert.deepEqual(gym.equipment, [])
    assert.deepEqual(gym.activities, [])
    assert.equal(gym.capacity, 50)
  })
})
