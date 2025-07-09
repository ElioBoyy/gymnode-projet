import { ExerciseTypeRepository } from '../../../domain/repositories/exercise_type_repository.js'

export interface GetExerciseTypeByIdRequest {
  exerciseTypeId: string
}

export interface ExerciseTypeDetails {
  id: string
  name: string
  description: string
  targetMuscles: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  createdAt: Date
  updatedAt: Date
}

export interface GetExerciseTypeByIdResponse {
  exerciseType: ExerciseTypeDetails
}

export class GetExerciseTypeByIdUseCase {
  constructor(private exerciseTypeRepository: ExerciseTypeRepository) {}

  async execute(request: GetExerciseTypeByIdRequest): Promise<GetExerciseTypeByIdResponse> {
    const exerciseType = await this.exerciseTypeRepository.findById(request.exerciseTypeId)

    if (!exerciseType) {
      throw new Error('Exercise type not found')
    }

    const exerciseTypeDetails: ExerciseTypeDetails = {
      id: exerciseType.id,
      name: exerciseType.name,
      description: exerciseType.description,
      targetMuscles: exerciseType.targetMuscles,
      difficulty: exerciseType.difficulty,
      createdAt: exerciseType.createdAt,
      updatedAt: exerciseType.updatedAt,
    }

    return {
      exerciseType: exerciseTypeDetails,
    }
  }
}
