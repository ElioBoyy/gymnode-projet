import { Collection, ObjectId } from 'mongodb'
import { Gym, GymStatus } from '../../domain/entities/gym.js'
import { GymRepository } from '../../domain/repositories/gym_repository.js'
import { MongoDBConnection } from '../database/mongodb_connection.js'

interface GymDocument {
  _id: ObjectId
  name: string
  address: string
  contact: string
  description: string
  capacity: number
  equipment: string[]
  activities: string[]
  ownerId: string
  status: GymStatus
  createdAt: Date
  updatedAt: Date
}

export class MongoDBGymRepository implements GymRepository {
  private collection: Collection<GymDocument>

  constructor() {
    const db = MongoDBConnection.getInstance().getDb()
    this.collection = db.collection<GymDocument>('gyms')
  }

  async findById(id: string): Promise<Gym | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) })
    return doc ? this.toDomain(doc) : null
  }

  async findByOwnerId(ownerId: string): Promise<Gym[]> {
    const docs = await this.collection.find({ ownerId }).toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  async findByStatus(status: GymStatus): Promise<Gym[]> {
    const docs = await this.collection.find({ status }).toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  async findAll(): Promise<Gym[]> {
    const docs = await this.collection.find({}).toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  async save(gym: Gym): Promise<void> {
    const doc: Omit<GymDocument, '_id'> = {
      name: gym.name,
      address: gym.address,
      contact: gym.contact,
      description: gym.description,
      capacity: gym.capacity,
      equipment: gym.equipment,
      activities: gym.activities,
      ownerId: gym.ownerId,
      status: gym.status,
      createdAt: gym.createdAt,
      updatedAt: gym.updatedAt,
    }

    // Use upsert to handle both insert and update cases
    await this.collection.replaceOne(
      { _id: new ObjectId(gym.id) },
      { ...doc, _id: new ObjectId(gym.id) } as GymDocument,
      { upsert: true }
    )
  }

  async update(gym: Gym): Promise<void> {
    const doc: Partial<GymDocument> = {
      name: gym.name,
      address: gym.address,
      contact: gym.contact,
      description: gym.description,
      capacity: gym.capacity,
      equipment: gym.equipment,
      activities: gym.activities,
      status: gym.status,
      updatedAt: gym.updatedAt,
    }
    await this.collection.updateOne({ _id: new ObjectId(gym.id) }, { $set: doc })
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: new ObjectId(id) })
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.collection.countDocuments({ _id: new ObjectId(id) })
    return count > 0
  }

  private toDomain(doc: GymDocument): Gym {
    return new Gym({
      id: doc._id.toString(),
      name: doc.name,
      address: doc.address,
      contact: doc.contact,
      description: doc.description,
      capacity: doc.capacity,
      equipment: doc.equipment,
      activities: doc.activities,
      ownerId: doc.ownerId,
      status: doc.status,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })
  }
}
