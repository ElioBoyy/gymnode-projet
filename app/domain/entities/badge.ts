export interface BadgeRule {
  type: 'challenge_completion' | 'streak' | 'participation' | 'custom'
  condition: string
  value: number
}

export class Badge {
  public readonly id: string
  public readonly name: string
  public readonly description: string
  public readonly iconUrl: string
  public readonly rules: BadgeRule[]
  public readonly isActive: boolean
  public readonly createdAt: Date
  public readonly updatedAt: Date

  constructor(props: {
    id: string
    name: string
    description: string
    iconUrl: string
    rules: BadgeRule[]
    isActive?: boolean
    createdAt?: Date
    updatedAt?: Date
  }) {
    this.id = props.id
    this.name = props.name
    this.description = props.description
    this.iconUrl = props.iconUrl
    this.rules = props.rules
    this.isActive = props.isActive ?? true
    this.createdAt = props.createdAt ?? new Date()
    this.updatedAt = props.updatedAt ?? new Date()
  }

  public deactivate(): Badge {
    return new Badge({
      id: this.id,
      name: this.name,
      description: this.description,
      iconUrl: this.iconUrl,
      rules: this.rules,
      isActive: false,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }

  public activate(): Badge {
    return new Badge({
      id: this.id,
      name: this.name,
      description: this.description,
      iconUrl: this.iconUrl,
      rules: this.rules,
      isActive: true,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }

  public updateRules(rules: BadgeRule[]): Badge {
    return new Badge({
      id: this.id,
      name: this.name,
      description: this.description,
      iconUrl: this.iconUrl,
      rules,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }
}
