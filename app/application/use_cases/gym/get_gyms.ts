import { inject } from '@adonisjs/core'
import { MongoDBGymRepository } from '../../../infrastructure/repositories/mongodb_gym_repository.js'
import { GymStatus } from '../../../domain/entities/gym.js'

export interface GetGymsRequest {
  status?: GymStatus
  page?: number
  limit?: number
}

export interface GymSummary {
  id: string
  name: string
  address: string
  contact: string
  description: string
  capacity: number
  equipment: string[]
  activities: string[]
  status: GymStatus
}

export interface GetGymsResponse {
  gyms: GymSummary[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

@inject()
export class GetGymsUseCase {
  constructor(private gymRepository: MongoDBGymRepository) {}

  async execute(request: GetGymsRequest): Promise<GetGymsResponse> {
    const page = request.page || 1
    const limit = request.limit || 20

    let gyms = await this.gymRepository.findAll()

    if (request.status) {
      gyms = gyms.filter((gym) => gym.status === request.status)
    } else {
      gyms = gyms.filter((gym) => gym.status === GymStatus.APPROVED)
    }

    const skip = (page - 1) * limit
    const paginatedGyms = gyms.slice(skip, skip + limit)
    const total = gyms.length

    const gymSummaries: GymSummary[] = paginatedGyms.map((gym) => ({
      id: gym.id,
      name: gym.name,
      address: gym.address,
      contact: gym.contact,
      description: gym.description,
      capacity: gym.capacity,
      equipment: gym.equipment,
      activities: gym.activities,
      status: gym.status,
    }))

    return {
      gyms: gymSummaries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }
}
