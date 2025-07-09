import { NotificationService } from '../../domain/services/notification_service.js'

export class ConsoleNotificationService implements NotificationService {
  async sendGymApprovalNotification(
    gymOwnerId: string,
    gymName: string,
    approved: boolean
  ): Promise<void> {
    const status = approved ? 'approved' : 'rejected'
    console.log(`Notification sent to user ${gymOwnerId}: Your gym "${gymName}" has been ${status}`)
  }

  async sendChallengeInvitation(
    userId: string,
    challengeId: string,
    inviterId: string
  ): Promise<void> {
    console.log(
      `Notification sent to user ${userId}: You have been invited to join challenge ${challengeId} by user ${inviterId}`
    )
  }

  async sendBadgeEarnedNotification(userId: string, badgeName: string): Promise<void> {
    console.log(
      `Notification sent to user ${userId}: Congratulations! You have earned the "${badgeName}" badge!`
    )
  }

  async sendChallengeCompletedNotification(userId: string, challengeTitle: string): Promise<void> {
    console.log(
      `Notification sent to user ${userId}: Congratulations! You have completed the "${challengeTitle}" challenge!`
    )
  }
}
