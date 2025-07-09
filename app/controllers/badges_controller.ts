import { HttpContext } from '@adonisjs/core/http'
import { MongoDBBadgeRepository } from '../infrastructure/repositories/mongodb_badge_repository.js'
import { MongoDBUserBadgeRepository } from '../infrastructure/repositories/mongodb_user_badge_repository.js'
import { inject } from '@adonisjs/core'

@inject()
export default class BadgesController {
  private badgeRepository = new MongoDBBadgeRepository()
  private userBadgeRepository = new MongoDBUserBadgeRepository()

  async index({ response }: HttpContext) {
    try {
      const badges = await this.badgeRepository.findActive()

      return response.json({
        status: 'success',
        data: badges.map((badge) => ({
          id: badge.id,
          name: badge.name,
          description: badge.description,
          iconUrl: badge.iconUrl,
          rules: badge.rules,
        })),
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Failed to fetch badges',
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const badge = await this.badgeRepository.findById(params.id)

      if (!badge) {
        return response.status(404).json({
          status: 'error',
          message: 'Badge not found',
        })
      }

      return response.json({
        status: 'success',
        data: {
          id: badge.id,
          name: badge.name,
          description: badge.description,
          iconUrl: badge.iconUrl,
          rules: badge.rules,
          isActive: badge.isActive,
          createdAt: badge.createdAt,
          updatedAt: badge.updatedAt,
        },
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Failed to fetch badge',
      })
    }
  }

  async myBadges({ response, auth }: HttpContext) {
    try {
      const userId = auth.user!.id
      const userBadges = await this.userBadgeRepository.findByUserId(userId)

      const badgesWithDetails = await Promise.all(
        userBadges.map(async (userBadge) => {
          const badge = await this.badgeRepository.findById(userBadge.badgeId)
          return {
            id: badge?.id,
            name: badge?.name,
            description: badge?.description,
            iconUrl: badge?.iconUrl,
            earnedAt: userBadge.earnedAt,
            metadata: userBadge.metadata,
          }
        })
      )

      return response.json({
        status: 'success',
        data: badgesWithDetails,
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Failed to fetch user badges',
      })
    }
  }
}
