import { test } from '@japa/runner'
import { CreateUserUseCase } from '../../../app/application/use_cases/user/create_user.js'
import { UserRole } from '../../../app/domain/entities/user.js'

test.group('CreateUserUseCase', (group) => {
  test('should create a new user successfully', async ({ assert }) => {
    const mockUserRepository = {
      findByEmail: async () => null,
      save: async () => {},
      findById: async () => null,
      findByRole: async () => [],
      findAll: async () => [],
      update: async () => {},
      delete: async () => {},
      exists: async () => false,
    }

    const mockPasswordService = {
      hash: async (password: string) => `hashed_${password}`,
      verify: async () => true,
    }

    const useCase = new CreateUserUseCase(mockUserRepository, mockPasswordService)

    const request = {
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.CLIENT,
    }

    const result = await useCase.execute(request)

    assert.equal(result.email, request.email)
    assert.equal(result.role, request.role)
    assert.isTrue(result.isActive)
    assert.instanceOf(result.createdAt, Date)
  })

  test('should throw error if user already exists', async ({ assert }) => {
    const mockUserRepository = {
      findByEmail: async () => ({
        id: '1',
        email: 'test@example.com',
        password: 'hashedpassword',
        role: UserRole.CLIENT,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      save: async () => {},
      findById: async () => null,
      findByRole: async () => [],
      findAll: async () => [],
      update: async () => {},
      delete: async () => {},
      exists: async () => false,
    }

    const mockPasswordService = {
      hash: async (password: string) => `hashed_${password}`,
      verify: async () => true,
    }

    const useCase = new CreateUserUseCase(mockUserRepository, mockPasswordService)

    const request = {
      email: 'test@example.com',
      password: 'password123',
      role: UserRole.CLIENT,
    }

    await assert.rejects(() => useCase.execute(request), 'User with this email already exists')
  })
})
