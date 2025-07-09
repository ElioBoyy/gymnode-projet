import { ApplicationService } from '@adonisjs/core/types'
import { MongoDBConnection } from '../app/infrastructure/database/mongodb_connection.js'
import { MongoDBUserRepository } from '../app/infrastructure/repositories/mongodb_user_repository.js'
import { MongoDBGymRepository } from '../app/infrastructure/repositories/mongodb_gym_repository.js'
import { MongoDBChallengeRepository } from '../app/infrastructure/repositories/mongodb_challenge_repository.js'
import { MongoDBChallengeParticipationRepository } from '../app/infrastructure/repositories/mongodb_challenge_participation_repository.js'
import { MongoDBBadgeRepository } from '../app/infrastructure/repositories/mongodb_badge_repository.js'
import { MongoDBUserBadgeRepository } from '../app/infrastructure/repositories/mongodb_user_badge_repository.js'
import { MongoDBExerciseTypeRepository } from '../app/infrastructure/repositories/mongodb_exercise_type_repository.js'
import { AdonisPasswordService } from '../app/infrastructure/services/adonis_password_service.js'
import { ConsoleNotificationService } from '../app/infrastructure/services/console_notification_service.js'
import { BadgeEvaluationService } from '../app/infrastructure/services/badge_evaluation_service.js'
import { CreateChallengeUseCase } from '../app/application/use_cases/challenge/create_challenge.js'
import { JoinChallengeUseCase } from '../app/application/use_cases/challenge/join_challenge.js'
import { AddWorkoutSessionUseCase } from '../app/application/use_cases/challenge/add_workout_session.js'
import { GetChallengesUseCase } from '../app/application/use_cases/challenge/get_challenges.js'
import { GetChallengeByIdUseCase } from '../app/application/use_cases/challenge/get_challenge_by_id.js'
import { UpdateChallengeUseCase } from '../app/application/use_cases/challenge/update_challenge.js'
import { DeleteChallengeUseCase } from '../app/application/use_cases/challenge/delete_challenge.js'
import { LeaveChallengeUseCase } from '../app/application/use_cases/challenge/leave_challenge.js'
import { GetChallengeParticipantsUseCase } from '../app/application/use_cases/challenge/get_challenge_participants.js'

export default class AppProvider {
  constructor(protected app: ApplicationService) {}

  async register() {
    await MongoDBConnection.getInstance().connect()

    this.app.container.bind(MongoDBUserRepository, () => {
      return new MongoDBUserRepository()
    })

    this.app.container.bind(MongoDBGymRepository, () => {
      return new MongoDBGymRepository()
    })

    this.app.container.bind(MongoDBChallengeRepository, () => {
      return new MongoDBChallengeRepository()
    })

    this.app.container.bind(MongoDBChallengeParticipationRepository, () => {
      return new MongoDBChallengeParticipationRepository()
    })

    this.app.container.bind(MongoDBBadgeRepository, () => {
      return new MongoDBBadgeRepository()
    })

    this.app.container.bind(MongoDBUserBadgeRepository, () => {
      return new MongoDBUserBadgeRepository()
    })

    this.app.container.bind(MongoDBExerciseTypeRepository, () => {
      return new MongoDBExerciseTypeRepository()
    })

    this.app.container.bind(AdonisPasswordService, () => {
      return new AdonisPasswordService()
    })

    this.app.container.bind(ConsoleNotificationService, () => {
      return new ConsoleNotificationService()
    })

    this.app.container.bind(BadgeEvaluationService, () => {
      const badgeRepository = new MongoDBBadgeRepository()
      const userBadgeRepository = new MongoDBUserBadgeRepository()
      const participationRepository = new MongoDBChallengeParticipationRepository()
      const notificationService = new ConsoleNotificationService()

      return new BadgeEvaluationService(
        badgeRepository,
        userBadgeRepository,
        participationRepository,
        notificationService
      )
    })

    // Challenge use cases
    this.app.container.bind(CreateChallengeUseCase, () => {
      return new CreateChallengeUseCase(
        new MongoDBChallengeRepository(),
        new MongoDBUserRepository(),
        new MongoDBGymRepository()
      )
    })

    this.app.container.bind(JoinChallengeUseCase, () => {
      return new JoinChallengeUseCase(
        new MongoDBChallengeRepository(),
        new MongoDBChallengeParticipationRepository(),
        new MongoDBUserRepository()
      )
    })

    this.app.container.bind(AddWorkoutSessionUseCase, () => {
      return new AddWorkoutSessionUseCase(
        new MongoDBChallengeParticipationRepository(),
        new BadgeEvaluationService(
          new MongoDBBadgeRepository(),
          new MongoDBUserBadgeRepository(),
          new MongoDBChallengeParticipationRepository(),
          new ConsoleNotificationService()
        )
      )
    })

    this.app.container.bind(GetChallengesUseCase, () => {
      return new GetChallengesUseCase(
        new MongoDBChallengeRepository(),
        new MongoDBChallengeParticipationRepository()
      )
    })

    this.app.container.bind(GetChallengeByIdUseCase, () => {
      return new GetChallengeByIdUseCase(
        new MongoDBChallengeRepository(),
        new MongoDBChallengeParticipationRepository()
      )
    })

    this.app.container.bind(UpdateChallengeUseCase, () => {
      return new UpdateChallengeUseCase(new MongoDBChallengeRepository())
    })

    this.app.container.bind(DeleteChallengeUseCase, () => {
      return new DeleteChallengeUseCase(
        new MongoDBChallengeRepository(),
        new MongoDBChallengeParticipationRepository()
      )
    })

    this.app.container.bind(LeaveChallengeUseCase, () => {
      return new LeaveChallengeUseCase(new MongoDBChallengeParticipationRepository())
    })

    this.app.container.bind(GetChallengeParticipantsUseCase, () => {
      return new GetChallengeParticipantsUseCase(
        new MongoDBChallengeRepository(),
        new MongoDBChallengeParticipationRepository(),
        new MongoDBUserRepository()
      )
    })
  }

  async boot() {}

  async start() {}

  async ready() {}

  async shutdown() {
    await MongoDBConnection.getInstance().disconnect()
  }
}
