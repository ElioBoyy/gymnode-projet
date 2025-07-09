import { Collection, ObjectId } from 'mongodb'
import { ExerciseType } from '../../domain/entities/exercise_type.js'
import { ExerciseTypeRepository } from '../../domain/repositories/exercise_type_repository.js'
import { MongoDBConnection } from '../database/mongodb_connection.js'

interface ExerciseTypeDocument {
  _id: ObjectId
  name: string
  description: string
  targetMuscles: string[]
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  createdAt: Date
  updatedAt: Date
}

export class MongoDBExerciseTypeRepository implements ExerciseTypeRepository {
  private collection: Collection<ExerciseTypeDocument>

  constructor() {
    const db = MongoDBConnection.getInstance().getDb()
    this.collection = db.collection<ExerciseTypeDocument>('exercise_types')
  }

  async findById(id: string): Promise<ExerciseType | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) })
    return doc ? this.toDomain(doc) : null
  }

  async findByName(name: string): Promise<ExerciseType | null> {
    const doc = await this.collection.findOne({ name })
    return doc ? this.toDomain(doc) : null
  }

  async findByDifficulty(
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<ExerciseType[]> {
    const docs = await this.collection.find({ difficulty }).toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  async findAll(): Promise<ExerciseType[]> {
    const docs = await this.collection.find({}).toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  async save(exerciseType: ExerciseType): Promise<void> {
    const doc: Omit<ExerciseTypeDocument, '_id'> = {
      name: exerciseType.name,
      description: exerciseType.description,
      targetMuscles: exerciseType.targetMuscles,
      difficulty: exerciseType.difficulty,
      createdAt: exerciseType.createdAt,
      updatedAt: exerciseType.updatedAt,
    }
    await this.collection.insertOne({ ...doc, _id: new ObjectId(exerciseType.id) })
  }

  async update(exerciseType: ExerciseType): Promise<void> {
    const doc: Partial<ExerciseTypeDocument> = {
      name: exerciseType.name,
      description: exerciseType.description,
      targetMuscles: exerciseType.targetMuscles,
      difficulty: exerciseType.difficulty,
      updatedAt: exerciseType.updatedAt,
    }
    await this.collection.updateOne({ _id: new ObjectId(exerciseType.id) }, { $set: doc })
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: new ObjectId(id) })
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.collection.countDocuments({ _id: new ObjectId(id) })
    return count > 0
  }

  private toDomain(doc: ExerciseTypeDocument): ExerciseType {
    return new ExerciseType({
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      targetMuscles: doc.targetMuscles,
      difficulty: doc.difficulty,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })
  }
}
