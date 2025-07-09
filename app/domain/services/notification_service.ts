export interface NotificationService {
  sendGymApprovalNotification(gymOwnerId: string, gymName: string, approved: boolean): Promise<void>
  sendChallengeInvitation(userId: string, challengeId: string, inviterId: string): Promise<void>
  sendBadgeEarnedNotification(userId: string, badgeName: string): Promise<void>
  sendChallengeCompletedNotification(userId: string, challengeTitle: string): Promise<void>
}
