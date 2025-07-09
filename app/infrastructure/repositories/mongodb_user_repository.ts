import { Collection, ObjectId } from 'mongodb'
import { User, UserRole } from '../../domain/entities/user.js'
import { UserRepository } from '../../domain/repositories/user_repository.js'
import { MongoDBConnection } from '../database/mongodb_connection.js'

interface UserDocument {
  _id: ObjectId
  email: string
  password: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export class MongoDBUserRepository implements UserRepository {
  private collection: Collection<UserDocument>

  constructor() {
    const db = MongoDBConnection.getInstance().getDb()
    this.collection = db.collection<UserDocument>('users')
  }

  async findById(id: string): Promise<User | null> {
    const doc = await this.collection.findOne({ _id: new ObjectId(id) })
    return doc ? this.toDomain(doc) : null
  }

  async findByEmail(email: string): Promise<User | null> {
    const doc = await this.collection.findOne({ email })
    return doc ? this.toDomain(doc) : null
  }

  async findByRole(role: UserRole): Promise<User[]> {
    const docs = await this.collection.find({ role }).toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  async findAll(): Promise<User[]> {
    const docs = await this.collection.find({}).toArray()
    return docs.map((doc) => this.toDomain(doc))
  }

  async save(user: User): Promise<void> {
    const doc: Omit<UserDocument, '_id'> = {
      email: user.email,
      password: user.password,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
    await this.collection.insertOne({ ...doc, _id: new ObjectId(user.id) })
  }

  async update(user: User): Promise<void> {
    const doc: Partial<UserDocument> = {
      email: user.email,
      password: user.password,
      role: user.role,
      isActive: user.isActive,
      updatedAt: user.updatedAt,
    }
    await this.collection.updateOne({ _id: new ObjectId(user.id) }, { $set: doc })
  }

  async delete(id: string): Promise<void> {
    await this.collection.deleteOne({ _id: new ObjectId(id) })
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.collection.countDocuments({ _id: new ObjectId(id) })
    return count > 0
  }

  private toDomain(doc: UserDocument): User {
    return new User({
      id: doc._id.toString(),
      email: doc.email,
      password: doc.password,
      role: doc.role,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    })
  }
}
