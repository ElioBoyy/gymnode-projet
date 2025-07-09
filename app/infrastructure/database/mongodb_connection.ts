import { MongoClient, Db } from 'mongodb'

export class MongoDBConnection {
  private static instance: MongoDBConnection
  private client: MongoClient | null = null
  private db: Db | null = null

  private constructor() {}

  public static getInstance(): MongoDBConnection {
    if (!MongoDBConnection.instance) {
      MongoDBConnection.instance = new MongoDBConnection()
    }
    return MongoDBConnection.instance
  }

  public async connect(): Promise<void> {
    const uri =
      process.env.MONGODB_URI || 'mongodb://admin:password@localhost:27017/gym_api?authSource=admin'

    try {
      this.client = new MongoClient(uri)
      await this.client.connect()
      this.db = this.client.db('gym_api')
      console.log('Successfully connected to MongoDB')
    } catch (error) {
      console.error('Failed to connect to MongoDB:', error)
      throw error
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close()
      this.client = null
      this.db = null
      console.log('Disconnected from MongoDB')
    }
  }

  public getDb(): Db {
    if (!this.db) {
      throw new Error('Database not initialized. Call connect() first.')
    }
    return this.db
  }

  public getClient(): MongoClient {
    if (!this.client) {
      throw new Error('Client not initialized. Call connect() first.')
    }
    return this.client
  }
}
