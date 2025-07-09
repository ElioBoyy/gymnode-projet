import { Collection, ObjectId } from 'mongodb'
import { Challenge, ChallengeStatus } from '../../domain/entities/challenge.js'
import { ChallengeRepository } from '../../domain/repositories/challenge_repository.js'
import { MongoDBConnection } from '../database/mongodb_connection.js'

interface ChallengeDocument {
  _id: ObjectId
  title: string
  description: string
  objectives: string[]
  exerciseTypes: string[]
  duration: number
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  creatorId: string
  gymId?: string
  status: ChallengeStatus
  maxParticipants?: number
  createdAt: Date
  updatedAt: Date
}

export class MongoDBChallengeRepository implements ChallengeRepository {
  private collection: Collection<ChallengeDocument>

  constructor() {
    const db = MongoDBConnection.getInstance().getDb()
    this.collection = db.collection<ChallengeDocument>('challenges')
  }

  async findById(id: string): Promise<Challenge | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) })
    return doc ? this.toDomain(doc) : null
  }

  async findByCreatorId(creatorId: string): Promise<Challenge[]> {
    const docs = await this.collection.find({ creatorId }).toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  async findByGymId(gymId: string): Promise<Challenge[]> {
    const docs = await this.collection.find({ gymId }).toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  async findByStatus(status: ChallengeStatus): Promise<Challenge[]> {
    const docs = await this.collection.find({ status }).toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  async findByDifficulty(
    difficulty: 'beginner' | 'intermediate' | 'advanced'
  ): Promise<Challenge[]> {
    const docs = await this.collection.find({ difficulty }).toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  async findActive(): Promise<Challenge[]> {
    const docs = await this.collection.find({ status: ChallengeStatus.ACTIVE }).toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  async findAll(): Promise<Challenge[]> {
    const docs = await this.collection.find({}).toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  async save(challenge: Challenge): Promise<void> {
    const doc: Omit<ChallengeDocument, '_id'> = {
      title: challenge.title,
      description: challenge.description,
      objectives: challenge.objectives,
      exerciseTypes: challenge.exerciseTypes,
      duration: challenge.duration,
      difficulty: challenge.difficulty,
      creatorId: challenge.creatorId,
      gymId: challenge.gymId,
      status: challenge.status,
      maxParticipants: challenge.maxParticipants,
      createdAt: challenge.createdAt,
      updatedAt: challenge.updatedAt,
    }

    // Use upsert to handle both insert and update cases
    await this.collection.replaceOne(
      { _id: new ObjectId(challenge.id) },
      { ...doc, _id: new ObjectId(challenge.id) } as ChallengeDocument,
      { upsert: true }
    )
  }

  async update(challenge: Challenge): Promise<void> {
    const doc: Partial<ChallengeDocument> = {
      title: challenge.title,
      description: challenge.description,
      objectives: challenge.objectives,
      exerciseTypes: challenge.exerciseTypes,
      duration: challenge.duration,
      difficulty: challenge.difficulty,
      gymId: challenge.gymId,
      status: challenge.status,
      maxParticipants: challenge.maxParticipants,
      updatedAt: challenge.updatedAt,
    }
    await this.collection.updateOne({ _id: new ObjectId(challenge.id) }, { $set: doc })
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: new ObjectId(id) })
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.collection.countDocuments({ _id: new ObjectId(id) })
    return count > 0
  }

  private toDomain(doc: ChallengeDocument): Challenge {
    return new Challenge({
      id: doc._id.toString(),
      title: doc.title,
      description: doc.description,
      objectives: doc.objectives,
      exerciseTypes: doc.exerciseTypes,
      duration: doc.duration,
      difficulty: doc.difficulty,
      creatorId: doc.creatorId,
      gymId: doc.gymId,
      status: doc.status,
      maxParticipants: doc.maxParticipants,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })
  }
}
