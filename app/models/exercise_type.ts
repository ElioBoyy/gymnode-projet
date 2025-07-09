import { MongoDBExerciseTypeRepository } from '../infrastructure/repositories/mongodb_exercise_type_repository.js'

export default class ExerciseType {
  declare id: string
  declare name: string
  declare description: string
  declare targetMuscles: string[]
  declare difficulty: 'beginner' | 'intermediate' | 'advanced'
  declare createdAt: Date
  declare updatedAt: Date

  constructor(data: {
    id: string
    name: string
    description: string
    targetMuscles: string[]
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    createdAt: Date
    updatedAt: Date
  }) {
    this.id = data.id
    this.name = data.name
    this.description = data.description
    this.targetMuscles = data.targetMuscles
    this.difficulty = data.difficulty
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  static async find(id: string): Promise<ExerciseType | null> {
    const repository = new MongoDBExerciseTypeRepository()
    const domainExerciseType = await repository.findById(id)

    if (!domainExerciseType) {
      return null
    }

    return new ExerciseType({
      id: domainExerciseType.id,
      name: domainExerciseType.name,
      description: domainExerciseType.description,
      targetMuscles: domainExerciseType.targetMuscles,
      difficulty: domainExerciseType.difficulty,
      createdAt: domainExerciseType.createdAt,
      updatedAt: domainExerciseType.updatedAt,
    })
  }

  static async findBy(field: string, value: any): Promise<ExerciseType[]> {
    const repository = new MongoDBExerciseTypeRepository()
    let domainExerciseTypes: any[] = []

    if (field === 'difficulty') {
      domainExerciseTypes = await repository.findByDifficulty(value)
    } else if (field === 'name') {
      const all = await repository.findAll()
      domainExerciseTypes = all.filter((exerciseType) =>
        exerciseType.name.toLowerCase().includes(value.toLowerCase())
      )
    }

    return domainExerciseTypes.map(
      (domainExerciseType) =>
        new ExerciseType({
          id: domainExerciseType.id,
          name: domainExerciseType.name,
          description: domainExerciseType.description,
          targetMuscles: domainExerciseType.targetMuscles,
          difficulty: domainExerciseType.difficulty,
          createdAt: domainExerciseType.createdAt,
          updatedAt: domainExerciseType.updatedAt,
        })
    )
  }

  static async findByDifficulty(
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<ExerciseType[]> {
    return this.findBy('difficulty', difficulty)
  }

  static async findByName(name: string): Promise<ExerciseType[]> {
    return this.findBy('name', name)
  }

  static async all(): Promise<ExerciseType[]> {
    const repository = new MongoDBExerciseTypeRepository()
    const domainExerciseTypes = await repository.findAll()

    return domainExerciseTypes.map(
      (domainExerciseType) =>
        new ExerciseType({
          id: domainExerciseType.id,
          name: domainExerciseType.name,
          description: domainExerciseType.description,
          targetMuscles: domainExerciseType.targetMuscles,
          difficulty: domainExerciseType.difficulty,
          createdAt: domainExerciseType.createdAt,
          updatedAt: domainExerciseType.updatedAt,
        })
    )
  }
}
