import { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import { ObjectId } from 'mongodb'
import { ApproveGymUseCase } from '../application/use_cases/gym/approve_gym.js'
import { GetPendingGymsUseCase } from '../application/use_cases/gym/get_pending_gyms.js'
import { GetGymsUseCase } from '../application/use_cases/gym/get_gyms.js'
import { MongoDBGymRepository } from '../infrastructure/repositories/mongodb_gym_repository.js'
import { MongoDBUserRepository } from '../infrastructure/repositories/mongodb_user_repository.js'
import { ConsoleNotificationService } from '../infrastructure/services/console_notification_service.js'
import { Gym } from '../domain/entities/gym.js'

export default class GymsController {
  private gymRepository = new MongoDBGymRepository()
  private userRepository = new MongoDBUserRepository()
  private notificationService = new ConsoleNotificationService()
  private approveGymUseCase = new ApproveGymUseCase(
    this.gymRepository,
    this.userRepository,
    this.notificationService
  )
  private getPendingGymsUseCase = new GetPendingGymsUseCase(this.gymRepository, this.userRepository)
  private getGymsUseCase = new GetGymsUseCase(this.gymRepository)

  async create({ request, response, auth }: HttpContext) {
    try {
      const createGymValidator = vine.compile(
        vine.object({
          name: vine.string(),
          address: vine.string(),
          contact: vine.string(),
          description: vine.string(),
          capacity: vine.number().min(1),
          equipment: vine.array(vine.string()),
          activities: vine.array(vine.string()),
        })
      )

      const data = await request.validateUsing(createGymValidator)

      const gym = new Gym({
        id: new ObjectId().toString(),
        name: data.name,
        address: data.address,
        contact: data.contact,
        description: data.description,
        capacity: data.capacity,
        equipment: data.equipment,
        activities: data.activities,
        ownerId: auth?.user?.id || new ObjectId().toString(),
      })

      await this.gymRepository.save(gym)

      return response.status(201).json({
        status: 'success',
        data: {
          id: gym.id,
          name: gym.name,
          address: gym.address,
          status: gym.status,
          createdAt: gym.createdAt,
        },
      })
    } catch (error) {
      console.error('Error in create gym:', error)
      return response.status(400).json({
        status: 'error',
        message: error.message,
      })
    }
  }

  async approve({ request, response, auth }: HttpContext) {
    try {
      const approveGymValidator = vine.compile(
        vine.object({
          approved: vine.boolean(),
        })
      )

      const data = await request.validateUsing(approveGymValidator)
      const gymId = request.param('id')

      const result = await this.approveGymUseCase.execute({
        gymId,
        adminId: auth.user!.id,
        approved: data.approved,
      })

      return response.json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      return response.status(400).json({
        status: 'error',
        message: error.message,
      })
    }
  }

  async pending({ response, auth }: HttpContext) {
    try {
      const result = await this.getPendingGymsUseCase.execute({
        adminId: auth.user!.id,
      })

      return response.json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      return response.status(403).json({
        status: 'error',
        message: error.message,
      })
    }
  }

  async index({ response, request }: HttpContext) {
    try {
      const page = Number.parseInt(request.input('page', '1'))
      const limit = Number.parseInt(request.input('limit', '20'))
      const status = request.input('status')

      const result = await this.getGymsUseCase.execute({
        page,
        limit,
        status,
      })

      return response.json({
        status: 'success',
        data: result,
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Failed to fetch gyms',
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      if (!ObjectId.isValid(params.id)) {
        return response.status(400).json({
          status: 'error',
          message: 'Invalid gym ID format',
        })
      }

      const gym = await this.gymRepository.findById(params.id)

      if (!gym) {
        return response.status(404).json({
          status: 'error',
          message: 'Gym not found',
        })
      }

      if (gym.status !== 'approved') {
        return response.status(404).json({
          status: 'error',
          message: 'Gym not found',
        })
      }

      return response.json({
        status: 'success',
        data: {
          id: gym.id,
          name: gym.name,
          address: gym.address,
          contact: gym.contact,
          description: gym.description,
          capacity: gym.capacity,
          equipment: gym.equipment,
          activities: gym.activities,
          status: gym.status,
          createdAt: gym.createdAt,
          updatedAt: gym.updatedAt,
        },
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Failed to fetch gym',
      })
    }
  }

  async update({ params, request, response, auth }: HttpContext) {
    try {
      const gym = await this.gymRepository.findById(params.id)

      if (!gym) {
        return response.status(404).json({
          status: 'error',
          message: 'Gym not found',
        })
      }

      if (auth?.user && gym.ownerId !== auth.user.id) {
        return response.status(403).json({
          status: 'error',
          message: 'Only the owner can update this gym',
        })
      }

      const updateGymValidator = vine.compile(
        vine.object({
          name: vine.string().optional(),
          address: vine.string().optional(),
          contact: vine.string().optional(),
          description: vine.string().optional(),
          capacity: vine.number().min(1).optional(),
          equipment: vine.array(vine.string()).optional(),
          activities: vine.array(vine.string()).optional(),
        })
      )

      const data = await request.validateUsing(updateGymValidator)

      Object.assign(gym, {
        ...data,
        updatedAt: new Date(),
      })

      await this.gymRepository.save(gym)

      return response.json({
        status: 'success',
        data: gym,
      })
    } catch (error) {
      return response.status(400).json({
        status: 'error',
        message: error.message,
      })
    }
  }
}
