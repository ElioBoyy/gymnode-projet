import { GymRepository } from '../../../domain/repositories/gym_repository.js'
import { GymStatus } from '../../../domain/entities/gym.js'

export interface GetGymByIdRequest {
  gymId: string
  includePrivate?: boolean
}

export interface GymDetails {
  id: string
  name: string
  address: string
  contact: string
  description: string
  capacity: number
  equipment: string[]
  activities: string[]
  ownerId: string
  status: GymStatus
  createdAt: Date
  updatedAt: Date
}

export interface GetGymByIdResponse {
  gym: GymDetails
}

export class GetGymByIdUseCase {
  constructor(private gymRepository: GymRepository) {}

  async execute(request: GetGymByIdRequest): Promise<GetGymByIdResponse> {
    const gym = await this.gymRepository.findById(request.gymId)

    if (!gym) {
      throw new Error('Gym not found')
    }

    if (!request.includePrivate && gym.status !== GymStatus.APPROVED) {
      throw new Error('Gym not found')
    }

    const gymDetails: GymDetails = {
      id: gym.id,
      name: gym.name,
      address: gym.address,
      contact: gym.contact,
      description: gym.description,
      capacity: gym.capacity,
      equipment: gym.equipment,
      activities: gym.activities,
      ownerId: gym.ownerId,
      status: gym.status,
      createdAt: gym.createdAt,
      updatedAt: gym.updatedAt,
    }

    return {
      gym: gymDetails,
    }
  }
}
