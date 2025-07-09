export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  GYM_OWNER = 'gym_owner',
  CLIENT = 'client',
}

export class User {
  public readonly id: string
  public readonly email: string
  public readonly password: string
  public readonly role: UserRole
  public readonly isActive: boolean
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: {
    id: string
    email: string
    password: string
    role: UserRole
    isActive?: boolean
    createdAt?: Date
    updatedAt?: Date
  }) {
    this.id = props.id
    this.email = props.email
    this.password = props.password
    this.role = props.role
    this.isActive = props.isActive ?? true
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  public deactivate(): User {
    return new User({
      id: this.id,
      email: this.email,
      password: this.password,
      role: this.role,
      isActive: false,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }

  public activate(): User {
    return new User({
      id: this.id,
      email: this.email,
      password: this.password,
      role: this.role,
      isActive: true,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }

  public isSuperAdmin(): boolean {
    return this.role === UserRole.SUPER_ADMIN
  }

  public isGymOwner(): boolean {
    return this.role === UserRole.GYM_OWNER
  }

  public isClient(): boolean {
    return this.role === UserRole.CLIENT
  }
}
