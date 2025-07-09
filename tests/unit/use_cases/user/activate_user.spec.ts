import { test } from '@japa/runner'
import { ActivateUserUseCase } from '../../../../app/application/use_cases/user/activate_user.js'
import { UserRepository } from '../../../../app/domain/repositories/user_repository.js'
import { User, UserRole } from '../../../../app/domain/entities/user.js'

test.group('ActivateUserUseCase', (group) => {
  let activateUserUseCase: ActivateUserUseCase
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

    activateUserUseCase = new ActivateUserUseCase(mockUserRepository)
  })

  test('should activate user successfully when user exists and is inactive', async ({ assert }) => {
    const mockUser = new User({
      id: '1',
      email: 'user@example.com',
      password: 'password',
      role: UserRole.CLIENT,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const mockAdmin = new User({
      id: 'admin1',
      email: 'admin@example.com',
      password: 'password',
      role: UserRole.SUPER_ADMIN,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockUserRepository.findById = async (id) => {
      if (id === '1') return mockUser
      if (id === 'admin1') return mockAdmin
      return null
    }
    mockUserRepository.save = async (user) => {
      // Simulate saving the user
    }

    const result = await activateUserUseCase.execute({
      userId: '1',
      activatedBy: 'admin1',
      activate: true,
    })

    assert.equal(result.user.id, '1')
    assert.equal(result.user.isActive, true)
    assert.equal(result.user.email, 'user@example.com')
    assert.equal(result.user.role, UserRole.CLIENT)
  })

  test('should throw error when user does not exist', async ({ assert }) => {
    mockUserRepository.findById = async () => null

    await assert.rejects(async () => {
      await activateUserUseCase.execute({
        userId: 'nonexistent',
        activatedBy: 'admin1',
        activate: true,
      })
    }, 'User not found')
  })

  test('should throw error when user is already active', async ({ assert }) => {
    const mockUser = new User({
      id: '1',
      email: 'user@example.com',
      password: 'password',
      role: UserRole.CLIENT,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockUserRepository.findById = async () => mockUser

    await assert.rejects(async () => {
      await activateUserUseCase.execute({
        userId: '1',
        activatedBy: 'admin1',
        activate: true,
      })
    }, 'Only super administrators can activate/deactivate users')
  })

  test('should activate gym owner user', async ({ assert }) => {
    const mockUser = new User({
      id: '1',
      email: 'owner@example.com',
      password: 'password',
      role: UserRole.GYM_OWNER,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockUserRepository.findById = async () => mockUser
    mockUserRepository.save = async (user) => {}

    const result = await activateUserUseCase.execute({
      userId: '1',
      activatedBy: 'admin1',
      activate: true,
    })

    assert.equal(result.user.id, '1')
    assert.equal(result.user.isActive, true)
    assert.equal(result.user.role, UserRole.GYM_OWNER)
  })

  test('should activate admin user', async ({ assert }) => {
    const mockUser = new User({
      id: '1',
      email: 'admin@example.com',
      password: 'password',
      role: UserRole.SUPER_ADMIN,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockUserRepository.findById = async () => mockUser
    mockUserRepository.save = async (user) => {}

    const result = await activateUserUseCase.execute({
      userId: '1',
      activatedBy: 'admin1',
      activate: true,
    })

    assert.equal(result.user.id, '1')
    assert.equal(result.user.isActive, true)
    assert.equal(result.user.role, UserRole.SUPER_ADMIN)
  })

  test('should not expose password in activated user details', async ({ assert }) => {
    const mockUser = new User({
      id: '1',
      email: 'user@example.com',
      password: 'secret-password',
      role: UserRole.CLIENT,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockUserRepository.findById = async () => mockUser
    mockUserRepository.save = async (user) => {}

    const result = await activateUserUseCase.execute({
      userId: '1',
      activatedBy: 'admin1',
      activate: true,
    })

    assert.equal(result.user.email, 'user@example.com')
    assert.equal(result.user.isActive, true)
    // Password should not be exposed
    assert.isUndefined((result.user as any).password)
  })

  test('should update user activation timestamp', async ({ assert }) => {
    const mockUser = new User({
      id: '1',
      email: 'user@example.com',
      password: 'password',
      role: UserRole.CLIENT,
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    let savedUser: User | null = null
    mockUserRepository.findById = async () => mockUser
    mockUserRepository.save = async (user) => {
      savedUser = user
    }

    const result = await activateUserUseCase.execute({
      userId: '1',
      activatedBy: 'admin1',
      activate: true,
    })

    assert.isNotNull(savedUser)
    assert.equal(savedUser?.isActive, true)
    assert.equal(result.user.isActive, true)
  })
})
