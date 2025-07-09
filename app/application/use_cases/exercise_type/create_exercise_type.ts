import { ObjectId } from 'mongodb'
import { ExerciseType } from '../../../domain/entities/exercise_type.js'
import { ExerciseTypeRepository } from '../../../domain/repositories/exercise_type_repository.js'
import { UserRepository } from '../../../domain/repositories/user_repository.js'
import { UserRole } from '../../../domain/entities/user.js'

export interface CreateExerciseTypeRequest {
  name: string
  description: string
  targetMuscles: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  adminId: string
}

export interface CreateExerciseTypeResponse {
  id: string
  name: string
  difficulty: string
  createdAt: Date
}

export class CreateExerciseTypeUseCase {
  constructor(
    private exerciseTypeRepository: ExerciseTypeRepository,
    private userRepository: UserRepository
  ) {}

  async execute(request: CreateExerciseTypeRequest): Promise<CreateExerciseTypeResponse> {
    const admin = await this.userRepository.findById(request.adminId)
    if (!admin || admin.role !== UserRole.SUPER_ADMIN) {
      throw new Error('Unauthorized: Only super admins can create exercise types')
    }

    const existingExerciseType = await this.exerciseTypeRepository.findByName(request.name)
    if (existingExerciseType) {
      throw new Error('Exercise type with this name already exists')
    }

    const exerciseType = new ExerciseType({
      id: new ObjectId().toString(),
      name: request.name,
      description: request.description,
      targetMuscles: request.targetMuscles,
      difficulty: request.difficulty,
    })

    await this.exerciseTypeRepository.save(exerciseType)

    return {
      id: exerciseType.id,
      name: exerciseType.name,
      difficulty: exerciseType.difficulty,
      createdAt: exerciseType.createdAt,
    }
  }
}
