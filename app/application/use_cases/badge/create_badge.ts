import { ObjectId } from 'mongodb'
import { Badge, BadgeRule } from '../../../domain/entities/badge.js'
import { BadgeRepository } from '../../../domain/repositories/badge_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { UserRole } from '../../../domain/entities/user.js'

export interface CreateBadgeRequest {
  name: string
  description: string
  iconUrl: string
  rules: BadgeRule[]
  adminId: string
}

export interface CreateBadgeResponse {
  id: string
  name: string
  description: string
  createdAt: Date
}

export class CreateBadgeUseCase {
  constructor(
    private badgeRepository: BadgeRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: CreateBadgeRequest): Promise<CreateBadgeResponse> {
    const admin = await this.userRepository.findById(request.adminId)
    if (!admin || admin.role !== UserRole.SUPER_ADMIN) {
      throw new Error('Unauthorized: Only super admins can create badges')
    }

    const existingBadge = await this.badgeRepository.findByName(request.name)
    if (existingBadge) {
      throw new Error('Badge with this name already exists')
    }

    const badge = new Badge({
      id: new ObjectId().toString(),
      name: request.name,
      description: request.description,
      iconUrl: request.iconUrl,
      rules: request.rules,
    })

    await this.badgeRepository.save(badge)

    return {
      id: badge.id,
      name: badge.name,
      description: badge.description,
      createdAt: badge.createdAt,
    }
  }
}
