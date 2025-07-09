export enum GymStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export class Gym {
  public readonly id: string
  public readonly name: string
  public readonly address: string
  public readonly contact: string
  public readonly description: string
  public readonly capacity: number
  public readonly equipment: string[]
  public readonly activities: string[]
  public readonly ownerId: string
  public readonly status: GymStatus
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: {
    id: string
    name: string
    address: string
    contact: string
    description: string
    capacity: number
    equipment: string[]
    activities: string[]
    ownerId: string
    status?: GymStatus
    createdAt?: Date
    updatedAt?: Date
  }) {
    this.id = props.id
    this.name = props.name
    this.address = props.address
    this.contact = props.contact
    this.description = props.description
    this.capacity = props.capacity
    this.equipment = props.equipment
    this.activities = props.activities
    this.ownerId = props.ownerId
    this.status = props.status ?? GymStatus.PENDING
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  public approve(): Gym {
    return new Gym({
      id: this.id,
      name: this.name,
      address: this.address,
      contact: this.contact,
      description: this.description,
      capacity: this.capacity,
      equipment: this.equipment,
      activities: this.activities,
      ownerId: this.ownerId,
      status: GymStatus.APPROVED,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }

  public reject(): Gym {
    return new Gym({
      id: this.id,
      name: this.name,
      address: this.address,
      contact: this.contact,
      description: this.description,
      capacity: this.capacity,
      equipment: this.equipment,
      activities: this.activities,
      ownerId: this.ownerId,
      status: GymStatus.REJECTED,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }

  public isApproved(): boolean {
    return this.status === GymStatus.APPROVED
  }

  public isPending(): boolean {
    return this.status === GymStatus.PENDING
  }
}
