import { GymStatus } from '../domain/entities/gym.js'
import { MongoDBGymRepository } from '../infrastructure/repositories/mongodb_gym_repository.js'

export default class Gym {
  declare id: string
  declare name: string
  declare address: string
  declare contact: string
  declare description: string
  declare capacity: number
  declare equipment: string[]
  declare activities: string[]
  declare ownerId: string
  declare status: GymStatus
  declare createdAt: Date
  declare updatedAt: Date

  constructor(data: {
    id: string
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
  }) {
    this.id = data.id
    this.name = data.name
    this.address = data.address
    this.contact = data.contact
    this.description = data.description
    this.capacity = data.capacity
    this.equipment = data.equipment
    this.activities = data.activities
    this.ownerId = data.ownerId
    this.status = data.status
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  static async find(id: string): Promise<Gym | null> {
    const repository = new MongoDBGymRepository()
    const domainGym = await repository.findById(id)

    if (!domainGym) {
      return null
    }

    return new Gym({
      id: domainGym.id,
      name: domainGym.name,
      address: domainGym.address,
      contact: domainGym.contact,
      description: domainGym.description,
      capacity: domainGym.capacity,
      equipment: domainGym.equipment,
      activities: domainGym.activities,
      ownerId: domainGym.ownerId,
      status: domainGym.status,
      createdAt: domainGym.createdAt,
      updatedAt: domainGym.updatedAt,
    })
  }

  static async findBy(field: string, value: any): Promise<Gym[]> {
    const repository = new MongoDBGymRepository()
    let domainGyms: any[] = []

    if (field === 'ownerId') {
      domainGyms = await repository.findByOwnerId(value)
    } else if (field === 'status') {
      domainGyms = await repository.findByStatus(value)
    }

    return domainGyms.map(
      (domainGym) =>
        new Gym({
          id: domainGym.id,
          name: domainGym.name,
          address: domainGym.address,
          contact: domainGym.contact,
          description: domainGym.description,
          capacity: domainGym.capacity,
          equipment: domainGym.equipment,
          activities: domainGym.activities,
          ownerId: domainGym.ownerId,
          status: domainGym.status,
          createdAt: domainGym.createdAt,
          updatedAt: domainGym.updatedAt,
        })
    )
  }

  static async findByOwnerId(ownerId: string): Promise<Gym[]> {
    return this.findBy('ownerId', ownerId)
  }

  static async findByStatus(status: GymStatus): Promise<Gym[]> {
    return this.findBy('status', status)
  }

  static async findApproved(): Promise<Gym[]> {
    return this.findByStatus(GymStatus.APPROVED)
  }

  static async findPending(): Promise<Gym[]> {
    return this.findByStatus(GymStatus.PENDING)
  }

  static async all(): Promise<Gym[]> {
    const repository = new MongoDBGymRepository()
    const domainGyms = await repository.findAll()

    return domainGyms.map(
      (domainGym) =>
        new Gym({
          id: domainGym.id,
          name: domainGym.name,
          address: domainGym.address,
          contact: domainGym.contact,
          description: domainGym.description,
          capacity: domainGym.capacity,
          equipment: domainGym.equipment,
          activities: domainGym.activities,
          ownerId: domainGym.ownerId,
          status: domainGym.status,
          createdAt: domainGym.createdAt,
          updatedAt: domainGym.updatedAt,
        })
    )
  }

  isApproved(): boolean {
    return this.status === GymStatus.APPROVED
  }

  isPending(): boolean {
    return this.status === GymStatus.PENDING
  }

  isRejected(): boolean {
    return this.status === GymStatus.REJECTED
  }
}
