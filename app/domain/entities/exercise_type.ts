export class ExerciseType {
  public readonly id: string
  public readonly name: string
  public readonly description: string
  public readonly targetMuscles: string[]
  public readonly difficulty: 'beginner' | 'intermediate' | 'advanced'
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: {
    id: string
    name: string
    description: string
    targetMuscles: string[]
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    createdAt?: Date
    updatedAt?: Date
  }) {
    this.id = props.id
    this.name = props.name
    this.description = props.description
    this.targetMuscles = props.targetMuscles
    this.difficulty = props.difficulty
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  public updateDescription(description: string): ExerciseType {
    return new ExerciseType({
      id: this.id,
      name: this.name,
      description,
      targetMuscles: this.targetMuscles,
      difficulty: this.difficulty,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }

  public addTargetMuscle(muscle: string): ExerciseType {
    if (this.targetMuscles.includes(muscle)) {
      return this
    }

    return new ExerciseType({
      id: this.id,
      name: this.name,
      description: this.description,
      targetMuscles: [...this.targetMuscles, muscle],
      difficulty: this.difficulty,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }
}
