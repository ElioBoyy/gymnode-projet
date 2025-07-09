import { Collection, ObjectId } from 'mongodb'
import { UserBadge } from '../../domain/entities/user_badge.js'
import { UserBadgeRepository } from '../../domain/repositories/user_badge_repository.js'
import { MongoDBConnection } from '../database/mongodb_connection.js'

interface UserBadgeDocument {
  _id: ObjectId
  userId: string
  badgeId: string
  earnedAt: Date
  relatedChallengeId?: string
  metadata?: Record<string, any>
}

export class MongoDBUserBadgeRepository implements UserBadgeRepository {
  private collection: Collection<UserBadgeDocument>

  constructor() {
    const db = MongoDBConnection.getInstance().getDb()
    this.collection = db.collection<UserBadgeDocument>('user_badges')
  }

  async findById(id: string): Promise<UserBadge | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) })
    return doc ? this.toDomain(doc) : null
  }

  async findByUserId(userId: string): Promise<UserBadge[]> {
    const docs = await this.collection.find({ userId }).toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  async findByBadgeId(badgeId: string): Promise<UserBadge[]> {
    const docs = await this.collection.find({ badgeId }).toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  async findByUserAndBadge(userId: string, badgeId: string): Promise<UserBadge | null> {
    const doc = await this.collection.findOne({ userId, badgeId })
    return doc ? this.toDomain(doc) : null
  }

  async findByChallengeId(challengeId: string): Promise<UserBadge[]> {
    const docs = await this.collection.find({ relatedChallengeId: challengeId }).toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  async save(userBadge: UserBadge): Promise<void> {
    const doc: Omit<UserBadgeDocument, '_id'> = {
      userId: userBadge.userId,
      badgeId: userBadge.badgeId,
      earnedAt: userBadge.earnedAt,
      relatedChallengeId: userBadge.relatedChallengeId,
      metadata: userBadge.metadata,
    }
    await this.collection.insertOne({ ...doc, _id: new ObjectId(userBadge.id) })
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: new ObjectId(id) })
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.collection.countDocuments({ _id: new ObjectId(id) })
    return count > 0
  }

  private toDomain(doc: UserBadgeDocument): UserBadge {
    return new UserBadge({
      id: doc._id.toString(),
      userId: doc.userId,
      badgeId: doc.badgeId,
      earnedAt: doc.earnedAt,
      relatedChallengeId: doc.relatedChallengeId,
      metadata: doc.metadata,
    })
  }
}
