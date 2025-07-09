import { UserRole } from '../domain/entities/user.js'
import { MongoDBUserRepository } from '../infrastructure/repositories/mongodb_user_repository.js'

export default class User {
  declare id: string
  declare email: string
  declare password: string
  declare role: UserRole
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date

  constructor(data: {
    id: string
    email: string
    password: string
    role: UserRole
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }) {
    this.id = data.id
    this.email = data.email
    this.password = data.password
    this.role = data.role
    this.isActive = data.isActive
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  static async find(id: string): Promise<User | null> {
    const repository = new MongoDBUserRepository()
    const domainUser = await repository.findById(id)

    if (!domainUser) {
      return null
    }

    return new User({
      id: domainUser.id,
      email: domainUser.email,
      password: domainUser.password,
      role: domainUser.role,
      isActive: domainUser.isActive,
      createdAt: domainUser.createdAt,
      updatedAt: domainUser.updatedAt,
    })
  }

  static async findBy(field: string, value: any): Promise<User | null> {
    const repository = new MongoDBUserRepository()
    let domainUser = null

    if (field === 'email') {
      domainUser = await repository.findByEmail(value)
    } else if (field === 'id') {
      domainUser = await repository.findById(value)
    }

    if (!domainUser) {
      return null
    }

    return new User({
      id: domainUser.id,
      email: domainUser.email,
      password: domainUser.password,
      role: domainUser.role,
      isActive: domainUser.isActive,
      createdAt: domainUser.createdAt,
      updatedAt: domainUser.updatedAt,
    })
  }

  static async findByEmail(email: string): Promise<User | null> {
    return this.findBy('email', email)
  }

  static async findByRole(role: UserRole): Promise<User[]> {
    const repository = new MongoDBUserRepository()
    const domainUsers = await repository.findByRole(role)

    return domainUsers.map(
      (domainUser) =>
        new User({
          id: domainUser.id,
          email: domainUser.email,
          password: domainUser.password,
          role: domainUser.role,
          isActive: domainUser.isActive,
          createdAt: domainUser.createdAt,
          updatedAt: domainUser.updatedAt,
        })
    )
  }

  static async all(): Promise<User[]> {
    const repository = new MongoDBUserRepository()
    const domainUsers = await repository.findAll()

    return domainUsers.map(
      (domainUser) =>
        new User({
          id: domainUser.id,
          email: domainUser.email,
          password: domainUser.password,
          role: domainUser.role,
          isActive: domainUser.isActive,
          createdAt: domainUser.createdAt,
          updatedAt: domainUser.updatedAt,
        })
    )
  }

  isSuperAdmin(): boolean {
    return this.role === UserRole.SUPER_ADMIN
  }

  isGymOwner(): boolean {
    return this.role === UserRole.GYM_OWNER
  }

  isClient(): boolean {
    return this.role === UserRole.CLIENT
  }
}
