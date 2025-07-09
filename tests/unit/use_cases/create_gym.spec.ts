import { test } from '@japa/runner'
import { CreateGymUseCase } from '../../../app/application/use_cases/gym/create_gym.js'
import { User, UserRole } from '../../../app/domain/entities/user.js'

test.group('CreateGymUseCase', (group) => {
  test('should create a new gym successfully', async ({ assert }) => {
    const gymOwner = new User({
      id: 'owner123',
      email: 'owner@example.com',
      password: 'hashedpassword',
      role: UserRole.GYM_OWNER,
    })

    const mockGymRepository = {
      save: async () => {},
      findById: async () => null,
      findByOwnerId: async () => [],
      findByStatus: async () => [],
      findAll: async () => [],
      update: async () => {},
      delete: async () => {},
      exists: async () => false,
    }

    const mockUserRepository = {
      findById: async () => gymOwner,
      findByEmail: async () => null,
      findByRole: async () => [],
      findAll: async () => [],
      save: async () => {},
      update: async () => {},
      delete: async () => {},
      exists: async () => false,
    }

    const useCase = new CreateGymUseCase(mockGymRepository, mockUserRepository)

    const request = {
      name: 'Test Gym',
      address: '123 Test Street',
      contact: 'test@gym.com',
      description: 'A test gym',
      capacity: 100,
      equipment: ['treadmill', 'weights'],
      activities: ['cardio', 'strength'],
      ownerId: 'owner123',
    }

    const result = await useCase.execute(request)

    assert.equal(result.name, request.name)
    assert.equal(result.address, request.address)
    assert.equal(result.status, 'pending')
    assert.instanceOf(result.createdAt, Date)
  })

  test('should throw error if owner is not found', async ({ assert }) => {
    const mockGymRepository = {
      save: async () => {},
      findById: async () => null,
      findByOwnerId: async () => [],
      findByStatus: async () => [],
      findAll: async () => [],
      update: async () => {},
      delete: async () => {},
      exists: async () => false,
    }

    const mockUserRepository = {
      findById: async () => null,
      findByEmail: async () => null,
      findByRole: async () => [],
      findAll: async () => [],
      save: async () => {},
      update: async () => {},
      delete: async () => {},
      exists: async () => false,
    }

    const useCase = new CreateGymUseCase(mockGymRepository, mockUserRepository)

    const request = {
      name: 'Test Gym',
      address: '123 Test Street',
      contact: 'test@gym.com',
      description: 'A test gym',
      capacity: 100,
      equipment: ['treadmill', 'weights'],
      activities: ['cardio', 'strength'],
      ownerId: 'owner123',
    }

    await assert.rejects(() => useCase.execute(request), 'Only gym owners can create gyms')
  })

  test('should throw error if user is not a gym owner', async ({ assert }) => {
    const client = new User({
      id: 'client123',
      email: 'client@example.com',
      password: 'hashedpassword',
      role: UserRole.CLIENT,
    })

    const mockGymRepository = {
      save: async () => {},
      findById: async () => null,
      findByOwnerId: async () => [],
      findByStatus: async () => [],
      findAll: async () => [],
      update: async () => {},
      delete: async () => {},
      exists: async () => false,
    }

    const mockUserRepository = {
      findById: async () => client,
      findByEmail: async () => null,
      findByRole: async () => [],
      findAll: async () => [],
      save: async () => {},
      update: async () => {},
      delete: async () => {},
      exists: async () => false,
    }

    const useCase = new CreateGymUseCase(mockGymRepository, mockUserRepository)

    const request = {
      name: 'Test Gym',
      address: '123 Test Street',
      contact: 'test@gym.com',
      description: 'A test gym',
      capacity: 100,
      equipment: ['treadmill', 'weights'],
      activities: ['cardio', 'strength'],
      ownerId: 'client123',
    }

    await assert.rejects(() => useCase.execute(request), 'Only gym owners can create gyms')
  })
})
