import { Badge } from '../entities/badge.js'

export interface BadgeRepository {
  findById(id: string): Promise<Badge | null>
  findByName(name: string): Promise<Badge | null>
  findActive(): Promise<Badge[]>
  findAll(): Promise<Badge[]>
  save(badge: Badge): Promise<void>
  update(badge: Badge): Promise<void>
  delete(id: string): Promise<void>
  exists(id: string): Promise<boolean>
}
