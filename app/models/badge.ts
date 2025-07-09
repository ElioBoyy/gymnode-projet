import { BadgeRule } from '../domain/entities/badge.js'
import { MongoDBBadgeRepository } from '../infrastructure/repositories/mongodb_badge_repository.js'

export default class Badge {
  declare id: string
  declare name: string
  declare description: string
  declare iconUrl: string
  declare rules: BadgeRule[]
  declare isActive: boolean
  declare createdAt: Date
  declare updatedAt: Date

  constructor(data: {
    id: string
    name: string
    description: string
    iconUrl: string
    rules: BadgeRule[]
    isActive: boolean
    createdAt: Date
    updatedAt: Date
  }) {
    this.id = data.id
    this.name = data.name
    this.description = data.description
    this.iconUrl = data.iconUrl
    this.rules = data.rules
    this.isActive = data.isActive
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  static async find(id: string): Promise<Badge | null> {
    const repository = new MongoDBBadgeRepository()
    const domainBadge = await repository.findById(id)

    if (!domainBadge) {
      return null
    }

    return new Badge({
      id: domainBadge.id,
      name: domainBadge.name,
      description: domainBadge.description,
      iconUrl: domainBadge.iconUrl,
      rules: domainBadge.rules,
      isActive: domainBadge.isActive,
      createdAt: domainBadge.createdAt,
      updatedAt: domainBadge.updatedAt,
    })
  }

  static async findBy(field: string, value: any): Promise<Badge | null> {
    const repository = new MongoDBBadgeRepository()
    let domainBadge = null

    if (field === 'name') {
      const badges = await repository.findAll()
      domainBadge = badges.find((badge) => badge.name === value) || null
    } else if (field === 'id') {
      domainBadge = await repository.findById(value)
    }

    if (!domainBadge) {
      return null
    }

    return new Badge({
      id: domainBadge.id,
      name: domainBadge.name,
      description: domainBadge.description,
      iconUrl: domainBadge.iconUrl,
      rules: domainBadge.rules,
      isActive: domainBadge.isActive,
      createdAt: domainBadge.createdAt,
      updatedAt: domainBadge.updatedAt,
    })
  }

  static async findActive(): Promise<Badge[]> {
    const repository = new MongoDBBadgeRepository()
    const domainBadges = await repository.findActive()

    return domainBadges.map(
      (badge) =>
        new Badge({
          id: badge.id,
          name: badge.name,
          description: badge.description,
          iconUrl: badge.iconUrl,
          rules: badge.rules,
          isActive: badge.isActive,
          createdAt: badge.createdAt,
          updatedAt: badge.updatedAt,
        })
    )
  }

  static async all(): Promise<Badge[]> {
    const repository = new MongoDBBadgeRepository()
    const domainBadges = await repository.findAll()

    return domainBadges.map(
      (badge) =>
        new Badge({
          id: badge.id,
          name: badge.name,
          description: badge.description,
          iconUrl: badge.iconUrl,
          rules: badge.rules,
          isActive: badge.isActive,
          createdAt: badge.createdAt,
          updatedAt: badge.updatedAt,
        })
    )
  }
}
