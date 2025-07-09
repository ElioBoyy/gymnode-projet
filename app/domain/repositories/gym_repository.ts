import { Gym, GymStatus } from '../entities/gym.js'

export interface GymRepository {
  findById(id: string): Promise<Gym | null>
  findByOwnerId(ownerId: string): Promise<Gym[]>
  findByStatus(status: GymStatus): Promise<Gym[]>
  findAll(): Promise<Gym[]>
  save(gym: Gym): Promise<void>
  update(gym: Gym): Promise<void>
  delete(id: string): Promise<void>
  exists(id: string): Promise<boolean>
}
