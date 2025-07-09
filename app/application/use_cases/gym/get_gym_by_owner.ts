import { GymRepository } from '../../../domain/repositories/gym_repository.js'
import { GymStatus } from '../../../domain/entities/gym.js'

export interface GetGymByOwnerRequest {
  ownerId: string
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
  status: GymStatus
  createdAt: Date
  updatedAt: Date
}

export interface GetGymByOwnerResponse {
  gym: GymDetails | null
}

export class GetGymByOwnerUseCase {
  constructor(private gymRepository: GymRepository) {}

  async execute(request: GetGymByOwnerRequest): Promise<GetGymByOwnerResponse> {
    const gyms = await this.gymRepository.findByOwnerId(request.ownerId)

    if (!gyms || gyms.length === 0) {
      return { gym: null }
    }

    const gym = gyms[0]

    const gymDetails: GymDetails = {
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
    }

    return {
      gym: gymDetails,
    }
  }
}
