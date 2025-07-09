import { ObjectId } from 'mongodb'
import { Gym } from '../../../domain/entities/gym.js'
import { GymRepository } from '../../../domain/repositories/gym_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { UserRole } from '../../../domain/entities/user.js'

export interface CreateGymRequest {
  name: string
  address: string
  contact: string
  description: string
  capacity: number
  equipment: string[]
  activities: string[]
  ownerId: string
}

export interface CreateGymResponse {
  id: string
  name: string
  address: string
  status: string
  createdAt: Date
}

export class CreateGymUseCase {
  constructor(
    private gymRepository: GymRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: CreateGymRequest): Promise<CreateGymResponse> {
    const owner = await this.userRepository.findById(request.ownerId)
    if (!owner || owner.role !== UserRole.GYM_OWNER) {
      throw new Error('Only gym owners can create gyms')
    }

    const gym = new Gym({
      id: new ObjectId().toString(),
      name: request.name,
      address: request.address,
      contact: request.contact,
      description: request.description,
      capacity: request.capacity,
      equipment: request.equipment,
      activities: request.activities,
      ownerId: request.ownerId,
    })

    await this.gymRepository.save(gym)

    return {
      id: gym.id,
      name: gym.name,
      address: gym.address,
      status: gym.status,
      createdAt: gym.createdAt,
    }
  }
}
