import { test } from '@japa/runner'
import { AuthenticateUserUseCase } from '../../../app/application/use_cases/user/authenticate_user.js'
import { User, UserRole } from '../../../app/domain/entities/user.js'

test.group('AuthenticateUserUseCase', (group) => {
  test('should authenticate user with valid credentials', async ({ assert }) => {
    const user = new User({
      id: '1',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: UserRole.CLIENT,
    })

    const mockUserRepository = {
      findByEmail: async () => user,
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

    const useCase = new AuthenticateUserUseCase(mockUserRepository, mockPasswordService)

    const request = {
      email: 'test@example.com',
      password: 'password123',
    }

    const result = await useCase.execute(request)

    assert.equal(result.id, user.id)
    assert.equal(result.email, user.email)
    assert.equal(result.role, user.role)
    assert.isTrue(result.isActive)
  })

  test('should throw error for non-existent user', async ({ assert }) => {
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

    const useCase = new AuthenticateUserUseCase(mockUserRepository, mockPasswordService)

    const request = {
      email: 'test@example.com',
      password: 'password123',
    }

    await assert.rejects(() => useCase.execute(request), 'Invalid credentials')
  })

  test('should throw error for deactivated user', async ({ assert }) => {
    const user = new User({
      id: '1',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: UserRole.CLIENT,
      isActive: false,
    })

    const mockUserRepository = {
      findByEmail: async () => user,
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

    const useCase = new AuthenticateUserUseCase(mockUserRepository, mockPasswordService)

    const request = {
      email: 'test@example.com',
      password: 'password123',
    }

    await assert.rejects(() => useCase.execute(request), 'Account is deactivated')
  })

  test('should throw error for invalid password', async ({ assert }) => {
    const user = new User({
      id: '1',
      email: 'test@example.com',
      password: 'hashedpassword',
      role: UserRole.CLIENT,
    })

    const mockUserRepository = {
      findByEmail: async () => user,
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
      verify: async () => false,
    }

    const useCase = new AuthenticateUserUseCase(mockUserRepository, mockPasswordService)

    const request = {
      email: 'test@example.com',
      password: 'wrongpassword',
    }

    await assert.rejects(() => useCase.execute(request), 'Invalid credentials')
  })
})
