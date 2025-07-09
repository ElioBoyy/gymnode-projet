import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { UserRole } from '../../../domain/entities/user.js'

export interface GetUsersRequest {
  role?: UserRole
  isActive?: boolean
  page?: number
  limit?: number
}

export interface UserSummary {
  id: string
  email: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface GetUsersResponse {
  users: UserSummary[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export class GetUsersUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: GetUsersRequest): Promise<GetUsersResponse> {
    const page = request.page || 1
    const limit = request.limit || 20

    let users = await this.userRepository.findAll()

    if (request.role) {
      users = users.filter((user) => user.role === request.role)
    }

    if (request.isActive !== undefined) {
      users = users.filter((user) => user.isActive === request.isActive)
    }

    const skip = (page - 1) * limit
    const paginatedUsers = users.slice(skip, skip + limit)
    const total = users.length

    const userSummaries: UserSummary[] = paginatedUsers.map((user) => ({
      id: user.id,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }))

    return {
      users: userSummaries,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }
  }
}
