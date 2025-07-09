import { ExerciseTypeRepository } from '../../../domain/repositories/exercise_type_repository.js'

export interface GetExerciseTypesRequest {
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
  targetMuscle?: string
}

export interface ExerciseTypeSummary {
  id: string
  name: string
  description: string
  targetMuscles: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface GetExerciseTypesResponse {
  exerciseTypes: ExerciseTypeSummary[]
}

export class GetExerciseTypesUseCase {
  constructor(private exerciseTypeRepository: ExerciseTypeRepository) {}

  async execute(request: GetExerciseTypesRequest): Promise<GetExerciseTypesResponse> {
    let exerciseTypes = await this.exerciseTypeRepository.findAll()

    // Apply filters
    if (request.difficulty) {
      exerciseTypes = exerciseTypes.filter((et) => et.difficulty === request.difficulty)
    }

    if (request.targetMuscle) {
      exerciseTypes = exerciseTypes.filter((et) =>
        et.targetMuscles.some((muscle) =>
          muscle.toLowerCase().includes(request.targetMuscle!.toLowerCase())
        )
      )
    }

    const exerciseTypeSummaries: ExerciseTypeSummary[] = exerciseTypes.map((exerciseType) => ({
      id: exerciseType.id,
      name: exerciseType.name,
      description: exerciseType.description,
      targetMuscles: exerciseType.targetMuscles,
      difficulty: exerciseType.difficulty,
    }))

    return {
      exerciseTypes: exerciseTypeSummaries,
    }
  }
}
