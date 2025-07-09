import { Collection, ObjectId } from 'mongodb'
import { Badge, BadgeRule } from '../../domain/entities/badge.js'
import { BadgeRepository } from '../../domain/repositories/badge_repository.js'
import { MongoDBConnection } from '../database/mongodb_connection.js'

interface BadgeDocument {
  _id: ObjectId
  name: string
  description: string
  iconUrl: string
  rules: BadgeRule[]
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export class MongoDBBadgeRepository implements BadgeRepository {
  private collection: Collection<BadgeDocument>

  constructor() {
    const db = MongoDBConnection.getInstance().getDb()
    this.collection = db.collection<BadgeDocument>('badges')
  }

  async findById(id: string): Promise<Badge | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) })
    return doc ? this.toDomain(doc) : null
  }

  async findByName(name: string): Promise<Badge | null> {
    const doc = await this.collection.findOne({ name })
    return doc ? this.toDomain(doc) : null
  }

  async findActive(): Promise<Badge[]> {
    const docs = await this.collection.find({ isActive: true }).toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  async findAll(): Promise<Badge[]> {
    const docs = await this.collection.find({}).toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  async save(badge: Badge): Promise<void> {
    const doc: Omit<BadgeDocument, '_id'> = {
      name: badge.name,
      description: badge.description,
      iconUrl: badge.iconUrl,
      rules: badge.rules,
      isActive: badge.isActive,
      createdAt: badge.createdAt,
      updatedAt: badge.updatedAt,
    }
    await this.collection.insertOne({ ...doc, _id: new ObjectId(badge.id) })
  }

  async update(badge: Badge): Promise<void> {
    const doc: Partial<BadgeDocument> = {
      name: badge.name,
      description: badge.description,
      iconUrl: badge.iconUrl,
      rules: badge.rules,
      isActive: badge.isActive,
      updatedAt: badge.updatedAt,
    }
    await this.collection.updateOne({ _id: new ObjectId(badge.id) }, { $set: doc })
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: new ObjectId(id) })
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.collection.countDocuments({ _id: new ObjectId(id) })
    return count > 0
  }

  private toDomain(doc: BadgeDocument): Badge {
    return new Badge({
      id: doc._id.toString(),
      name: doc.name,
      description: doc.description,
      iconUrl: doc.iconUrl,
      rules: doc.rules,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })
  }
}
