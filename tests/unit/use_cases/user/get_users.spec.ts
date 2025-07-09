import { test } from '@japa/runner'
import { GetUsersUseCase } from '../../../../app/application/use_cases/user/get_users.js'
import { UserRepository } from '../../../../app/domain/repositories/user_repository.js'
import { User, UserRole } from '../../../../app/domain/entities/user.js'

test.group('GetUsersUseCase', (group) => {
  let getUsersUseCase: GetUsersUseCase
  let mockUserRepository: UserRepository

  group.setup(async () => {
    mockUserRepository = {
      findAll: async () => [],
      findById: async () => null,
      findByEmail: async () => null,
      findByRole: async () => [],
      save: async () => {},
      update: async () => {},
      delete: async () => {},
      exists: async () => false,
    } as UserRepository

    getUsersUseCase = new GetUsersUseCase(mockUserRepository)
  })

  test('should return paginated users with default pagination', async ({ assert }) => {
    const mockUsers = [
      new User({
        id: '1',
        email: 'user1@example.com',
        password: 'password',
        role: UserRole.CLIENT,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new User({
        id: '2',
        email: 'user2@example.com',
        password: 'password',
        role: UserRole.GYM_OWNER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]

    mockUserRepository.findAll = async () => mockUsers

    const result = await getUsersUseCase.execute({})

    assert.equal(result.users.length, 2)
    assert.equal(result.pagination.page, 1)
    assert.equal(result.pagination.limit, 20)
    assert.equal(result.pagination.total, 2)
    assert.equal(result.pagination.totalPages, 1)
  })

  test('should filter users by role', async ({ assert }) => {
    const mockUsers = [
      new User({
        id: '1',
        email: 'client@example.com',
        password: 'password',
        role: UserRole.CLIENT,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new User({
        id: '2',
        email: 'owner@example.com',
        password: 'password',
        role: UserRole.GYM_OWNER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]

    mockUserRepository.findAll = async () => mockUsers

    const result = await getUsersUseCase.execute({
      role: UserRole.CLIENT,
    })

    assert.equal(result.users.length, 1)
    assert.equal(result.users[0].role, UserRole.CLIENT)
    assert.equal(result.users[0].email, 'client@example.com')
  })

  test('should filter users by active status', async ({ assert }) => {
    const mockUsers = [
      new User({
        id: '1',
        email: 'active@example.com',
        password: 'password',
        role: UserRole.CLIENT,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new User({
        id: '2',
        email: 'inactive@example.com',
        password: 'password',
        role: UserRole.CLIENT,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]

    mockUserRepository.findAll = async () => mockUsers

    const result = await getUsersUseCase.execute({
      isActive: true,
    })

    assert.equal(result.users.length, 1)
    assert.equal(result.users[0].isActive, true)
    assert.equal(result.users[0].email, 'active@example.com')
  })

  test('should filter users by inactive status', async ({ assert }) => {
    const mockUsers = [
      new User({
        id: '1',
        email: 'active@example.com',
        password: 'password',
        role: UserRole.CLIENT,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new User({
        id: '2',
        email: 'inactive@example.com',
        password: 'password',
        role: UserRole.CLIENT,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]

    mockUserRepository.findAll = async () => mockUsers

    const result = await getUsersUseCase.execute({
      isActive: false,
    })

    assert.equal(result.users.length, 1)
    assert.equal(result.users[0].isActive, false)
    assert.equal(result.users[0].email, 'inactive@example.com')
  })

  test('should handle pagination correctly', async ({ assert }) => {
    const mockUsers = Array.from(
      { length: 25 },
      (_, i) =>
        new User({
          id: `${i + 1}`,
          email: `user${i + 1}@example.com`,
          password: 'password',
          role: UserRole.CLIENT,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
    )

    mockUserRepository.findAll = async () => mockUsers

    const result = await getUsersUseCase.execute({
      page: 2,
      limit: 10,
    })

    assert.equal(result.users.length, 10)
    assert.equal(result.pagination.page, 2)
    assert.equal(result.pagination.limit, 10)
    assert.equal(result.pagination.total, 25)
    assert.equal(result.pagination.totalPages, 3)
  })

  test('should return empty array when no users exist', async ({ assert }) => {
    mockUserRepository.findAll = async () => []

    const result = await getUsersUseCase.execute({})

    assert.equal(result.users.length, 0)
    assert.equal(result.pagination.total, 0)
  })

  test('should combine role and active status filters', async ({ assert }) => {
    const mockUsers = [
      new User({
        id: '1',
        email: 'active-client@example.com',
        password: 'password',
        role: UserRole.CLIENT,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new User({
        id: '2',
        email: 'inactive-client@example.com',
        password: 'password',
        role: UserRole.CLIENT,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new User({
        id: '3',
        email: 'active-owner@example.com',
        password: 'password',
        role: UserRole.GYM_OWNER,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]

    mockUserRepository.findAll = async () => mockUsers

    const result = await getUsersUseCase.execute({
      role: UserRole.CLIENT,
      isActive: true,
    })

    assert.equal(result.users.length, 1)
    assert.equal(result.users[0].role, UserRole.CLIENT)
    assert.equal(result.users[0].isActive, true)
    assert.equal(result.users[0].email, 'active-client@example.com')
  })

  test('should not expose password in user summary', async ({ assert }) => {
    const mockUser = new User({
      id: '1',
      email: 'user@example.com',
      password: 'secret-password',
      role: UserRole.CLIENT,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockUserRepository.findAll = async () => [mockUser]

    const result = await getUsersUseCase.execute({})

    assert.equal(result.users.length, 1)
    assert.equal(result.users[0].email, 'user@example.com')
    assert.equal(result.users[0].role, UserRole.CLIENT)
    assert.equal(result.users[0].isActive, true)
    // Password should not be exposed
    assert.isUndefined((result.users[0] as any).password)
  })
})
