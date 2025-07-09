import { test } from '@japa/runner'
import { GetUserByIdUseCase } from '../../../../app/application/use_cases/user/get_user_by_id.js'
import { UserRepository } from '../../../../app/domain/repositories/user_repository.js'
import { User, UserRole } from '../../../../app/domain/entities/user.js'

test.group('GetUserByIdUseCase', (group) => {
  let getUserByIdUseCase: GetUserByIdUseCase
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

    getUserByIdUseCase = new GetUserByIdUseCase(mockUserRepository)
  })

  test('should return user details when user exists', async ({ assert }) => {
    const mockUser = new User({
      id: '1',
      email: 'user@example.com',
      password: 'password',
      role: UserRole.CLIENT,
      isActive: true,
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
    })

    mockUserRepository.findById = async (id) => {
      return id === '1' ? mockUser : null
    }

    const result = await getUserByIdUseCase.execute({
      userId: '1',
    })

    assert.equal(result.user.id, '1')
    assert.equal(result.user.email, 'user@example.com')
    assert.equal(result.user.role, UserRole.CLIENT)
    assert.equal(result.user.isActive, true)
    assert.exists(result.user.createdAt)
    assert.exists(result.user.updatedAt)
  })

  test('should throw error when user does not exist', async ({ assert }) => {
    mockUserRepository.findById = async () => null

    await assert.rejects(async () => {
      await getUserByIdUseCase.execute({
        userId: 'nonexistent',
      })
    }, 'User not found')
  })

  test('should return client user details', async ({ assert }) => {
    const mockUser = new User({
      id: '1',
      email: 'client@example.com',
      password: 'password',
      role: UserRole.CLIENT,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockUserRepository.findById = async () => mockUser

    const result = await getUserByIdUseCase.execute({
      userId: '1',
    })

    assert.equal(result.user.role, UserRole.CLIENT)
    assert.equal(result.user.email, 'client@example.com')
  })

  test('should return gym owner user details', async ({ assert }) => {
    const mockUser = new User({
      id: '1',
      email: 'owner@example.com',
      password: 'password',
      role: UserRole.GYM_OWNER,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockUserRepository.findById = async () => mockUser

    const result = await getUserByIdUseCase.execute({
      userId: '1',
    })

    assert.equal(result.user.role, UserRole.GYM_OWNER)
    assert.equal(result.user.email, 'owner@example.com')
  })

  test('should return admin user details', async ({ assert }) => {
    const mockUser = new User({
      id: '1',
      email: 'admin@example.com',
      password: 'password',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockUserRepository.findById = async () => mockUser

    const result = await getUserByIdUseCase.execute({
      userId: '1',
    })

    assert.equal(result.user.role, UserRole.SUPER_ADMIN)
    assert.equal(result.user.email, 'admin@example.com')
  })

  test('should return inactive user details', async ({ assert }) => {
    const mockUser = new User({
      id: '1',
      email: 'inactive@example.com',
      password: 'password',
      role: UserRole.CLIENT,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockUserRepository.findById = async () => mockUser

    const result = await getUserByIdUseCase.execute({
      userId: '1',
    })

    assert.equal(result.user.isActive, false)
    assert.equal(result.user.email, 'inactive@example.com')
  })

  test('should not expose password in user details', async ({ assert }) => {
    const mockUser = new User({
      id: '1',
      email: 'user@example.com',
      password: 'secret-password',
      role: UserRole.CLIENT,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockUserRepository.findById = async () => mockUser

    const result = await getUserByIdUseCase.execute({
      userId: '1',
    })

    assert.equal(result.user.email, 'user@example.com')
    assert.equal(result.user.role, UserRole.CLIENT)
    assert.equal(result.user.isActive, true)
    // Password should not be exposed
    assert.isUndefined((result.user as any).password)
  })
})
