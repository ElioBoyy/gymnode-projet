import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { GymRepository } from '../../../domain/repositories/gym_repository.js'
import { ChallengeRepository } from '../../../domain/repositories/challenge_repository.js'
import { ChallengeParticipationRepository } from '../../../domain/repositories/challenge_participation_repository.js'
import { BadgeRepository } from '../../../domain/repositories/badge_repository.js'
import { ExerciseTypeRepository } from '../../../domain/repositories/exercise_type_repository.js'

export interface GetDashboardStatsRequest {
  adminId: string
}

export interface AdminDashboardStats {
  users: {
    total: number
    active: number
    clients: number
    gymOwners: number
    superAdmins: number
  }
  gyms: {
    total: number
    approved: number
    pending: number
    rejected: number
  }
  challenges: {
    total: number
    active: number
    completed: number
  }
  participations: {
    total: number
    active: number
    completed: number
  }
  badges: {
    total: number
    active: number
  }
  exerciseTypes: {
    total: number
  }
}

export interface GetDashboardStatsResponse {
  stats: AdminDashboardStats
}

export class GetDashboardStatsUseCase {
  constructor(
    private userRepository: UserRepository,
    private gymRepository: GymRepository,
    private challengeRepository: ChallengeRepository,
    private participationRepository: ChallengeParticipationRepository,
    private badgeRepository: BadgeRepository,
    private exerciseTypeRepository: ExerciseTypeRepository
  ) {}

  async execute(request: GetDashboardStatsRequest): Promise<GetDashboardStatsResponse> {
    const admin = await this.userRepository.findById(request.adminId)
    if (!admin || !admin.isSuperAdmin()) {
      throw new Error('Only super administrators can access dashboard stats')
    }

    const [users, gyms, challenges, badges, exerciseTypes] = await Promise.all([
      this.userRepository.findAll(),
      this.gymRepository.findAll(),
      this.challengeRepository.findAll(),
      this.badgeRepository.findAll(),
      this.exerciseTypeRepository.findAll(),
    ])

    const allParticipations = []
    for (const challenge of challenges) {
      const participations = await this.participationRepository.findByChallengeId(challenge.id)
      allParticipations.push(...participations)
    }

    const userStats = {
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      clients: users.filter((u) => u.isClient()).length,
      gymOwners: users.filter((u) => u.isGymOwner()).length,
      superAdmins: users.filter((u) => u.isSuperAdmin()).length,
    }

    const gymStats = {
      total: gyms.length,
      approved: gyms.filter((g) => g.isApproved()).length,
      pending: gyms.filter((g) => g.isPending()).length,
      rejected: gyms.filter((g) => g.status === 'rejected').length,
    }

    const challengeStats = {
      total: challenges.length,
      active: challenges.filter((c) => c.isActive()).length,
      completed: challenges.filter((c) => c.status === 'completed').length,
    }

    const participationStats = {
      total: allParticipations.length,
      active: allParticipations.filter((p) => p.status === 'active').length,
      completed: allParticipations.filter((p) => p.status === 'completed').length,
    }

    const badgeStats = {
      total: badges.length,
      active: badges.filter((b) => b.isActive).length,
    }

    const exerciseTypeStats = {
      total: exerciseTypes.length,
    }

    const stats: AdminDashboardStats = {
      users: userStats,
      gyms: gymStats,
      challenges: challengeStats,
      participations: participationStats,
      badges: badgeStats,
      exerciseTypes: exerciseTypeStats,
    }

    return { stats }
  }
}
