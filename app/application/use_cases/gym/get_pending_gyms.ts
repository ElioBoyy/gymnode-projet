import { GymRepository } from '../../../domain/repositories/gym_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { UserRole } from '../../../domain/entities/user.js'
import { GymStatus } from '../../../domain/entities/gym.js'

export interface GetPendingGymsRequest {
  adminId: string
}

export interface GymSummary {
  id: string
  name: string
  address: string
  ownerId: string
  status: string
  createdAt: Date
}

export interface GetPendingGymsResponse {
  gyms: GymSummary[]
  total: number
}

export class GetPendingGymsUseCase {
  constructor(
    private gymRepository: GymRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: GetPendingGymsRequest): Promise<GetPendingGymsResponse> {
    const admin = await this.userRepository.findById(request.adminId)
    if (!admin || admin.role !== UserRole.SUPER_ADMIN) {
      throw new Error('Unauthorized: Only super admins can view pending gyms')
    }

    const pendingGyms = await this.gymRepository.findByStatus(GymStatus.PENDING)

    const gymSummaries: GymSummary[] = pendingGyms.map((gym) => ({
      id: gym.id,
      name: gym.name,
      address: gym.address,
      ownerId: gym.ownerId,
      status: gym.status,
      createdAt: gym.createdAt,
    }))

    return {
      gyms: gymSummaries,
      total: gymSummaries.length,
    }
  }
}
