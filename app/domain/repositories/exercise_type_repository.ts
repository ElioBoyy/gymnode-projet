import { ExerciseType } from '../entities/exercise_type.js'

export interface ExerciseTypeRepository {
  findById(id: string): Promise<ExerciseType | null>
  findByName(name: string): Promise<ExerciseType | null>
  findByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<ExerciseType[]>
  findAll(): Promise<ExerciseType[]>
  save(exerciseType: ExerciseType): Promise<void>
  update(exerciseType: ExerciseType): Promise<void>
  delete(id: string): Promise<void>
  exists(id: string): Promise<boolean>
}
