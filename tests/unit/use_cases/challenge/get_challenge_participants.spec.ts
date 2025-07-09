import { test } from '@japa/runner'
import { GetChallengeParticipantsUseCase } from '../../../../app/application/use_cases/challenge/get_challenge_participants.js'
import { ChallengeRepository } from '../../../../app/domain/repositories/challenge_repository.js'
import { ChallengeParticipationRepository } from '../../../../app/domain/repositories/challenge_participation_repository.js'
import { Challenge, ChallengeStatus } from '../../../../app/domain/entities/challenge.js'
import {
  ChallengeParticipation,
  ParticipationStatus,
} from '../../../../app/domain/entities/challenge_participation.js'

test.group('GetChallengeParticipantsUseCase', (group) => {
  let getChallengeParticipantsUseCase: GetChallengeParticipantsUseCase
  let mockChallengeRepository: ChallengeRepository
  let mockParticipationRepository: ChallengeParticipationRepository

  group.setup(async () => {
    mockChallengeRepository = {
      findAll: async () => [],
      findById: async () => null,
      findByCreatorId: async () => [],
      findByStatus: async () => [],
      findByGymId: async () => [],
      save: async () => {},
      delete: async () => {},
    } as ChallengeRepository

    mockParticipationRepository = {
      findAll: async () => [],
      findById: async () => null,
      findByUserId: async () => [],
      findByChallengeId: async () => [],
      findByUserAndChallenge: async () => null,
      findByStatus: async () => [],
      save: async () => {},
      delete: async () => {},
    } as ChallengeParticipationRepository

    getChallengeParticipantsUseCase = new GetChallengeParticipantsUseCase(
      mockChallengeRepository,
      mockParticipationRepository
    )
  })

  test('should return participants list when challenge exists', async ({ assert }) => {
    const mockChallenge = new Challenge({
      id: '1',
      title: 'Test Challenge',
      description: 'Test Description',
      objectives: ['Objective'],
      exerciseTypes: ['Exercise'],
      duration: 30,
      difficulty: 'beginner',
      status: ChallengeStatus.ACTIVE,
      creatorId: 'user1',
      maxParticipants: 50,
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const mockParticipations = [
      new ChallengeParticipation({
        id: '1',
        userId: 'user2',
        challengeId: '1',
        status: ParticipationStatus.ACTIVE,
        joinedAt: new Date('2023-01-01'),
        workoutSessions: [
          {
            id: '1',
            date: new Date(),
            duration: 30,
            caloriesBurned: 200,
            exercisesCompleted: ['Exercise 1'],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }),
      new ChallengeParticipation({
        id: '2',
        userId: 'user3',
        challengeId: '1',
        status: ParticipationStatus.COMPLETED,
        joinedAt: new Date('2023-01-02'),
        completedAt: new Date('2023-01-30'),
        workoutSessions: [
          {
            id: '2',
            date: new Date(),
            duration: 45,
            caloriesBurned: 300,
            exercisesCompleted: ['Exercise 1', 'Exercise 2'],
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
      }),
    ]

    mockChallengeRepository.findById = async () => mockChallenge
    mockParticipationRepository.findByChallengeId = async () => mockParticipations

    const result = await getChallengeParticipantsUseCase.execute({
      challengeId: '1',
    })

    assert.equal(result.challenge.id, '1')
    assert.equal(result.challenge.title, 'Test Challenge')
    assert.equal(result.challenge.maxParticipants, 50)
    assert.equal(result.participants.length, 2)
    assert.equal(result.stats.total, 2)
    assert.equal(result.stats.active, 1)
    assert.equal(result.stats.completed, 1)
    assert.equal(result.stats.abandoned, 0)
  })

  test('should throw error when challenge does not exist', async ({ assert }) => {
    mockChallengeRepository.findById = async () => null

    await assert.rejects(async () => {
      await getChallengeParticipantsUseCase.execute({
        challengeId: 'nonexistent',
      })
    }, 'Challenge not found')
  })

  test('should return empty participants list when no participants exist', async ({ assert }) => {
    const mockChallenge = new Challenge({
      id: '1',
      title: 'Test Challenge',
      description: 'Test Description',
      objectives: ['Objective'],
      exerciseTypes: ['Exercise'],
      duration: 30,
      difficulty: 'beginner',
      status: ChallengeStatus.ACTIVE,
      creatorId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockChallengeRepository.findById = async () => mockChallenge
    mockParticipationRepository.findByChallengeId = async () => []

    const result = await getChallengeParticipantsUseCase.execute({
      challengeId: '1',
    })

    assert.equal(result.participants.length, 0)
    assert.equal(result.stats.total, 0)
    assert.equal(result.stats.active, 0)
    assert.equal(result.stats.completed, 0)
    assert.equal(result.stats.abandoned, 0)
  })

  test('should calculate participant progress correctly', async ({ assert }) => {
    const mockChallenge = new Challenge({
      id: '1',
      title: 'Test Challenge',
      description: 'Test Description',
      objectives: ['Objective'],
      exerciseTypes: ['Exercise'],
      duration: 30,
      difficulty: 'beginner',
      status: ChallengeStatus.ACTIVE,
      creatorId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const mockParticipation = new ChallengeParticipation({
      id: '1',
      userId: 'user2',
      challengeId: '1',
      status: ParticipationStatus.ACTIVE,
      joinedAt: new Date(),
      workoutSessions: [
        {
          id: '1',
          date: new Date(),
          duration: 30,
          caloriesBurned: 200,
          exercisesCompleted: ['Exercise 1'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: '2',
          date: new Date(),
          duration: 45,
          caloriesBurned: 300,
          exercisesCompleted: ['Exercise 1', 'Exercise 2'],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    })

    mockChallengeRepository.findById = async () => mockChallenge
    mockParticipationRepository.findByChallengeId = async () => [mockParticipation]

    const result = await getChallengeParticipantsUseCase.execute({
      challengeId: '1',
    })

    assert.equal(result.participants.length, 1)
    assert.equal(result.participants[0].userId, 'user2')
    assert.equal(result.participants[0].status, ParticipationStatus.ACTIVE)
    assert.equal(result.participants[0].workoutCount, 2)
    assert.exists(result.participants[0].progress)
  })

  test('should handle participants with different statuses', async ({ assert }) => {
    const mockChallenge = new Challenge({
      id: '1',
      title: 'Test Challenge',
      description: 'Test Description',
      objectives: ['Objective'],
      exerciseTypes: ['Exercise'],
      duration: 30,
      difficulty: 'beginner',
      status: ChallengeStatus.ACTIVE,
      creatorId: 'user1',
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const mockParticipations = [
      new ChallengeParticipation({
        id: '1',
        userId: 'user2',
        challengeId: '1',
        status: ParticipationStatus.ACTIVE,
        joinedAt: new Date(),
        workoutSessions: [],
      }),
      new ChallengeParticipation({
        id: '2',
        userId: 'user3',
        challengeId: '1',
        status: ParticipationStatus.COMPLETED,
        joinedAt: new Date(),
        completedAt: new Date(),
        workoutSessions: [],
      }),
      new ChallengeParticipation({
        id: '3',
        userId: 'user4',
        challengeId: '1',
        status: ParticipationStatus.ABANDONED,
        joinedAt: new Date(),
        abandonedAt: new Date(),
        workoutSessions: [],
      }),
    ]

    mockChallengeRepository.findById = async () => mockChallenge
    mockParticipationRepository.findByChallengeId = async () => mockParticipations

    const result = await getChallengeParticipantsUseCase.execute({
      challengeId: '1',
    })

    assert.equal(result.participants.length, 3)
    assert.equal(result.stats.total, 3)
    assert.equal(result.stats.active, 1)
    assert.equal(result.stats.completed, 1)
    assert.equal(result.stats.abandoned, 1)
  })
})
