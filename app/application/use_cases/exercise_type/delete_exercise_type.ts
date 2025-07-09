import { ExerciseTypeRepository } from '../../../domain/repositories/exercise_type_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { ChallengeRepository } from '../../../domain/repositories/challenge_repository.js'

export interface DeleteExerciseTypeRequest {
  exerciseTypeId: string
  deletedBy: string
}

export interface DeleteExerciseTypeResponse {
  success: boolean
  message: string
}

export class DeleteExerciseTypeUseCase {
  constructor(
    private exerciseTypeRepository: ExerciseTypeRepository,
    private userRepository: UserRepository,
    private challengeRepository: ChallengeRepository
  ) {}

  async execute(request: DeleteExerciseTypeRequest): Promise<DeleteExerciseTypeResponse> {
    const user = await this.userRepository.findById(request.deletedBy)
    if (!user || !user.isSuperAdmin()) {
      throw new Error('Only super administrators can delete exercise types')
    }

    const exerciseType = await this.exerciseTypeRepository.findById(request.exerciseTypeId)

    if (!exerciseType) {
      throw new Error('Exercise type not found')
    }

    const challenges = await this.challengeRepository.findAll()
    const isUsedInChallenges = challenges.some((challenge) =>
      challenge.exerciseTypes.includes(exerciseType.name)
    )

    if (isUsedInChallenges) {
      throw new Error('Cannot delete exercise type that is used in challenges')
    }

    await this.exerciseTypeRepository.delete(request.exerciseTypeId)

    return {
      success: true,
      message: 'Exercise type deleted successfully',
    }
  }
}
