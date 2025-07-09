import { GymRepository } from '../../../domain/repositories/gym_repository.js'
import { Gym, GymStatus } from '../../../domain/entities/gym.js'

export interface UpdateGymRequest {
  gymId: string
  updatedBy: string
  name?: string
  address?: string
  contact?: string
  description?: string
  capacity?: number
  equipment?: string[]
  activities?: string[]
}

export interface UpdateGymResponse {
  success: boolean
  gym: {
    id: string
    name: string
    address: string
    contact: string
    description: string
    capacity: number
    equipment: string[]
    activities: string[]
    status: GymStatus
    updatedAt: Date
  }
}

export class UpdateGymUseCase {
  constructor(private gymRepository: GymRepository) {}

  async execute(request: UpdateGymRequest): Promise<UpdateGymResponse> {
    const gym = await this.gymRepository.findById(request.gymId)

    if (!gym) {
      throw new Error('Gym not found')
    }

    if (gym.ownerId !== request.updatedBy) {
      throw new Error('Only the owner can update this gym')
    }

    const updatedGym = new Gym({
      id: gym.id,
      name: request.name || gym.name,
      address: request.address || gym.address,
      contact: request.contact || gym.contact,
      description: request.description || gym.description,
      capacity: request.capacity || gym.capacity,
      equipment: request.equipment || gym.equipment,
      activities: request.activities || gym.activities,
      ownerId: gym.ownerId,
      status: gym.status,
      createdAt: gym.createdAt,
      updatedAt: new Date(),
    })

    await this.gymRepository.save(updatedGym)

    return {
      success: true,
      gym: {
        id: updatedGym.id,
        name: updatedGym.name,
        address: updatedGym.address,
        contact: updatedGym.contact,
        description: updatedGym.description,
        capacity: updatedGym.capacity,
        equipment: updatedGym.equipment,
        activities: updatedGym.activities,
        status: updatedGym.status,
        updatedAt: updatedGym.updatedAt,
      },
    }
  }
}
