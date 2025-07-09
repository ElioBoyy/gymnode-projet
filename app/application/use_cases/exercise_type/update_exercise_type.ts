import { ExerciseTypeRepository } from '../../../domain/repositories/exercise_type_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { ExerciseType } from '../../../domain/entities/exercise_type.js'

export interface UpdateExerciseTypeRequest {
  exerciseTypeId: string
  updatedBy: string
  name?: string
  description?: string
  targetMuscles?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

export interface UpdateExerciseTypeResponse {
  success: boolean
  exerciseType: {
    id: string
    name: string
    description: string
    targetMuscles: string[]
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    updatedAt: Date
  }
}

export class UpdateExerciseTypeUseCase {
  constructor(
    private exerciseTypeRepository: ExerciseTypeRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: UpdateExerciseTypeRequest): Promise<UpdateExerciseTypeResponse> {
    const user = await this.userRepository.findById(request.updatedBy)
    if (!user || !user.isSuperAdmin()) {
      throw new Error('Only super administrators can update exercise types')
    }

    const exerciseType = await this.exerciseTypeRepository.findById(request.exerciseTypeId)

    if (!exerciseType) {
      throw new Error('Exercise type not found')
    }

    const updatedExerciseType = new ExerciseType({
      id: exerciseType.id,
      name: request.name || exerciseType.name,
      description: request.description || exerciseType.description,
      targetMuscles: request.targetMuscles || exerciseType.targetMuscles,
      difficulty: request.difficulty || exerciseType.difficulty,
      createdAt: exerciseType.createdAt,
      updatedAt: new Date(),
    })

    await this.exerciseTypeRepository.save(updatedExerciseType)

    return {
      success: true,
      exerciseType: {
        id: updatedExerciseType.id,
        name: updatedExerciseType.name,
        description: updatedExerciseType.description,
        targetMuscles: updatedExerciseType.targetMuscles,
        difficulty: updatedExerciseType.difficulty,
        updatedAt: updatedExerciseType.updatedAt,
      },
    }
  }
}
