import { test } from '@japa/runner'
import { GetGymsUseCase } from '../../../../app/application/use_cases/gym/get_gyms.js'
import { GymRepository } from '../../../../app/domain/repositories/gym_repository.js'
import { Gym, GymStatus } from '../../../../app/domain/entities/gym.js'

test.group('GetGymsUseCase', (group) => {
  let getGymsUseCase: GetGymsUseCase
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

    getGymsUseCase = new GetGymsUseCase(mockGymRepository)
  })

  test('should return approved gyms by default', async ({ assert }) => {
    const mockGyms = [
      new Gym({
        id: '1',
        name: 'Approved Gym',
        address: '123 Street',
        contact: 'contact@gym.com',
        description: 'Description',
        capacity: 100,
        equipment: ['Treadmill'],
        activities: ['Cardio'],
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
        equipment: ['Treadmill'],
        activities: ['Cardio'],
        status: GymStatus.PENDING,
        ownerId: 'owner2',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]

    mockGymRepository.findAll = async () => mockGyms

    const result = await getGymsUseCase.execute({})

    assert.equal(result.gyms.length, 1)
    assert.equal(result.gyms[0].status, GymStatus.APPROVED)
    assert.equal(result.gyms[0].name, 'Approved Gym')
  })

  test('should filter gyms by status when specified', async ({ assert }) => {
    const mockGyms = [
      new Gym({
        id: '1',
        name: 'Approved Gym',
        address: '123 Street',
        contact: 'contact@gym.com',
        description: 'Description',
        capacity: 100,
        equipment: ['Treadmill'],
        activities: ['Cardio'],
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
        equipment: ['Treadmill'],
        activities: ['Cardio'],
        status: GymStatus.PENDING,
        ownerId: 'owner2',
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]

    mockGymRepository.findAll = async () => mockGyms

    const result = await getGymsUseCase.execute({
      status: GymStatus.PENDING,
    })

    assert.equal(result.gyms.length, 1)
    assert.equal(result.gyms[0].status, GymStatus.PENDING)
    assert.equal(result.gyms[0].name, 'Pending Gym')
  })

  test('should handle pagination correctly', async ({ assert }) => {
    const mockGyms = Array.from(
      { length: 25 },
      (_, i) =>
        new Gym({
          id: `${i + 1}`,
          name: `Gym ${i + 1}`,
          address: `${i + 1} Street`,
          contact: 'contact@gym.com',
          description: 'Description',
          capacity: 100,
          equipment: ['Equipment'],
          activities: ['Activity'],
          status: GymStatus.APPROVED,
          ownerId: 'owner1',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
    )

    mockGymRepository.findAll = async () => mockGyms

    const result = await getGymsUseCase.execute({
      page: 2,
      limit: 10,
    })

    assert.equal(result.gyms.length, 10)
    assert.equal(result.pagination.page, 2)
    assert.equal(result.pagination.limit, 10)
    assert.equal(result.pagination.total, 25)
    assert.equal(result.pagination.totalPages, 3)
  })

  test('should return empty array when no gyms exist', async ({ assert }) => {
    mockGymRepository.findAll = async () => []

    const result = await getGymsUseCase.execute({})

    assert.equal(result.gyms.length, 0)
    assert.equal(result.pagination.total, 0)
  })

  test('should include all gym details in summary', async ({ assert }) => {
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
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockGymRepository.findAll = async () => [mockGym]

    const result = await getGymsUseCase.execute({})

    assert.equal(result.gyms.length, 1)
    const gym = result.gyms[0]
    assert.equal(gym.id, '1')
    assert.equal(gym.name, 'Test Gym')
    assert.equal(gym.address, '123 Test Street')
    assert.equal(gym.contact, 'test@gym.com')
    assert.equal(gym.description, 'Test Description')
    assert.equal(gym.capacity, 150)
    assert.deepEqual(gym.equipment, ['Treadmill', 'Weights'])
    assert.deepEqual(gym.activities, ['Cardio', 'Strength'])
    assert.equal(gym.status, GymStatus.APPROVED)
  })
})
