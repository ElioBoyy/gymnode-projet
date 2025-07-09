import { User, UserRole } from '../entities/user.js'

export interface UserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findByRole(role: UserRole): Promise<User[]>
  findAll(): Promise<User[]>
  save(user: User): Promise<void>
  update(user: User): Promise<void>
  delete(id: string): Promise<void>
  exists(id: string): Promise<boolean>
}
