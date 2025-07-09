import { Collection, ObjectId } from 'mongodb'
import {
  ChallengeParticipation,
  ParticipationStatus,
  WorkoutSession,
} from '../../domain/entities/challenge_participation.js'
import { ChallengeParticipationRepository } from '../../domain/repositories/challenge_participation_repository.js'
import { MongoDBConnection } from '../database/mongodb_connection.js'

interface ChallengeParticipationDocument {
  _id: ObjectId
  challengeId: string
  userId: string
  status: ParticipationStatus
  progress: number
  workoutSessions: WorkoutSession[]
  joinedAt: Date
  completedAt?: Date
  updatedAt: Date
}

export class MongoDBChallengeParticipationRepository implements ChallengeParticipationRepository {
  private collection: Collection<ChallengeParticipationDocument>

  constructor() {
    const db = MongoDBConnection.getInstance().getDb()
    this.collection = db.collection<ChallengeParticipationDocument>('challenge_participations')
  }

  async findById(id: string): Promise<ChallengeParticipation | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) })
    return doc ? this.toDomain(doc) : null
  }

  async findByUserId(userId: string): Promise<ChallengeParticipation[]> {
    const docs = await this.collection.find({ userId }).toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  async findByChallengeId(challengeId: string): Promise<ChallengeParticipation[]> {
    const docs = await this.collection.find({ challengeId }).toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  async findByUserAndChallenge(
    userId: string,
    challengeId: string
  ): Promise<ChallengeParticipation | null> {
    const doc = await this.collection.findOne({ userId, challengeId })
    return doc ? this.toDomain(doc) : null
  }

  async findByStatus(status: ParticipationStatus): Promise<ChallengeParticipation[]> {
    const docs = await this.collection.find({ status }).toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  async findActiveByUserId(userId: string): Promise<ChallengeParticipation[]> {
    const docs = await this.collection
      .find({ userId, status: ParticipationStatus.ACTIVE })
      .toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  async findCompletedByUserId(userId: string): Promise<ChallengeParticipation[]> {
    const docs = await this.collection
      .find({ userId, status: ParticipationStatus.COMPLETED })
      .toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  async getLeaderboard(challengeId: string, limit: number = 10): Promise<ChallengeParticipation[]> {
    const docs = await this.collection
      .find({ challengeId })
      .sort({ progress: -1 })
      .limit(limit)
      .toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  async save(participation: ChallengeParticipation): Promise<void> {
    const doc: Omit<ChallengeParticipationDocument, '_id'> = {
      challengeId: participation.challengeId,
      userId: participation.userId,
      status: participation.status,
      progress: participation.progress,
      workoutSessions: participation.workoutSessions,
      joinedAt: participation.joinedAt,
      completedAt: participation.completedAt,
      updatedAt: participation.updatedAt,
    }

    const fullDoc = {
      ...doc,
      _id: new ObjectId(participation.id),
    } as ChallengeParticipationDocument
    await this.collection.replaceOne({ _id: new ObjectId(participation.id) }, fullDoc, {
      upsert: true,
    })
  }

  async update(participation: ChallengeParticipation): Promise<void> {
    const doc: Partial<ChallengeParticipationDocument> = {
      status: participation.status,
      progress: participation.progress,
      workoutSessions: participation.workoutSessions,
      completedAt: participation.completedAt,
      updatedAt: participation.updatedAt,
    }
    await this.collection.updateOne({ _id: new ObjectId(participation.id) }, { $set: doc })
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: new ObjectId(id) })
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.collection.countDocuments({ _id: new ObjectId(id) })
    return count > 0
  }

  private toDomain(doc: ChallengeParticipationDocument): ChallengeParticipation {
    return new ChallengeParticipation({
      id: doc._id.toString(),
      challengeId: doc.challengeId,
      userId: doc.userId,
      status: doc.status,
      progress: doc.progress,
      workoutSessions: doc.workoutSessions,
      joinedAt: doc.joinedAt,
      completedAt: doc.completedAt,
      updatedAt: doc.updatedAt,
    })
  }
}
