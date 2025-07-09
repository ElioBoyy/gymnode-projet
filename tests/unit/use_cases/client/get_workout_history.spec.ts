import { test } from '@japa/runner'
import { GetWorkoutHistoryUseCase } from '../../../../app/application/use_cases/client/get_workout_history.js'
import { ChallengeParticipationRepository } from '../../../../app/domain/repositories/challenge_participation_repository.js'
import { ChallengeParticipation } from '../../../../app/domain/entities/challenge_participation.js'

test.group('GetWorkoutHistoryUseCase', (group) => {
  let getWorkoutHistoryUseCase: GetWorkoutHistoryUseCase
  let mockParticipationRepository: ChallengeParticipationRepository

  group.setup(async () => {
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

    getWorkoutHistoryUseCase = new GetWorkoutHistoryUseCase(mockParticipationRepository)
  })

  test('should return paginated workout history', async ({ assert }) => {
    const mockParticipations = [
      new ChallengeParticipation({
        id: '1',
        userId: 'user1',
        challengeId: 'challenge1',
        status: ParticipationStatus.ACTIVE,
        joinedAt: new Date(),
        workoutSessions: [
          {
            id: '1',
            date: new Date('2023-01-05'),
            duration: 30,
            caloriesBurned: 200,
            exercisesCompleted: ['Push-ups'],
            notes: 'Good workout',
          },
          {
            id: '2',
            date: new Date('2023-01-10'),
            duration: 45,
            caloriesBurned: 300,
            exercisesCompleted: ['Squats', 'Running'],
            notes: 'Intense session',
          },
        ],
      }),
      new ChallengeParticipation({
        id: '2',
        userId: 'user1',
        challengeId: 'challenge2',
        status: ParticipationStatus.COMPLETED,
        joinedAt: new Date(),
        workoutSessions: [
          {
            id: '3',
            date: new Date('2023-01-15'),
            duration: 60,
            caloriesBurned: 400,
            exercisesCompleted: ['Cycling'],
          },
        ],
      }),
    ]

    mockParticipationRepository.findByUserId = async () => mockParticipations

    const result = await getWorkoutHistoryUseCase.execute({
      userId: 'user1',
    })

    assert.equal(result.workouts.length, 3)
    assert.equal(result.pagination.total, 3)
    assert.equal(result.pagination.page, 1)
    assert.equal(result.pagination.limit, 20)

    // Should be sorted by date descending
    assert.equal(result.workouts[0].id, '3') // Most recent
    assert.equal(result.workouts[1].id, '2')
    assert.equal(result.workouts[2].id, '1') // Oldest
  })

  test('should handle pagination correctly', async ({ assert }) => {
    const mockParticipations = [
      new ChallengeParticipation({
        id: '1',
        userId: 'user1',
        challengeId: 'challenge1',
        status: ParticipationStatus.ACTIVE,
        joinedAt: new Date(),
        workoutSessions: Array.from({ length: 15 }, (_, i) => ({
          id: `${i + 1}`,
          date: new Date(`2023-01-${i + 1}`),
          duration: 30,
          caloriesBurned: 200,
          exercisesCompleted: ['Exercise'],
        })),
      }),
    ]

    mockParticipationRepository.findByUserId = async () => mockParticipations

    const result = await getWorkoutHistoryUseCase.execute({
      userId: 'user1',
      page: 2,
      limit: 10,
    })

    assert.equal(result.workouts.length, 5)
    assert.equal(result.pagination.page, 2)
    assert.equal(result.pagination.limit, 10)
    assert.equal(result.pagination.total, 15)
    assert.equal(result.pagination.totalPages, 2)
  })

  test('should filter workouts by date range', async ({ assert }) => {
    const mockParticipations = [
      new ChallengeParticipation({
        id: '1',
        userId: 'user1',
        challengeId: 'challenge1',
        status: ParticipationStatus.ACTIVE,
        joinedAt: new Date(),
        workoutSessions: [
          {
            id: '1',
            date: new Date('2023-01-05'),
            duration: 30,
            caloriesBurned: 200,
            exercisesCompleted: ['Push-ups'],
          },
          {
            id: '2',
            date: new Date('2023-02-10'),
            duration: 45,
            caloriesBurned: 300,
            exercisesCompleted: ['Squats'],
          },
          {
            id: '3',
            date: new Date('2023-03-15'),
            duration: 60,
            caloriesBurned: 400,
            exercisesCompleted: ['Running'],
          },
        ],
      }),
    ]

    mockParticipationRepository.findByUserId = async () => mockParticipations

    const result = await getWorkoutHistoryUseCase.execute({
      userId: 'user1',
      startDate: new Date('2023-02-01'),
      endDate: new Date('2023-02-28'),
    })

    assert.equal(result.workouts.length, 1)
    assert.equal(result.workouts[0].id, '2')
  })

  test('should return empty array when user has no workouts', async ({ assert }) => {
    mockParticipationRepository.findByUserId = async () => []

    const result = await getWorkoutHistoryUseCase.execute({
      userId: 'user1',
    })

    assert.equal(result.workouts.length, 0)
    assert.equal(result.pagination.total, 0)
  })

  test('should include challenge information in workout details', async ({ assert }) => {
    const mockParticipations = [
      new ChallengeParticipation({
        id: '1',
        userId: 'user1',
        challengeId: 'challenge1',
        status: ParticipationStatus.ACTIVE,
        joinedAt: new Date(),
        workoutSessions: [
          {
            id: '1',
            date: new Date('2023-01-05'),
            duration: 30,
            caloriesBurned: 200,
            exercisesCompleted: ['Push-ups'],
            notes: 'Good workout',
          },
        ],
      }),
    ]

    mockParticipationRepository.findByUserId = async () => mockParticipations

    const result = await getWorkoutHistoryUseCase.execute({
      userId: 'user1',
    })

    assert.equal(result.workouts.length, 1)
    assert.equal(result.workouts[0].challengeId, 'challenge1')
    assert.equal(result.workouts[0].participationId, '1')
    assert.equal(result.workouts[0].duration, 30)
    assert.equal(result.workouts[0].caloriesBurned, 200)
    assert.deepEqual(result.workouts[0].exercisesCompleted, ['Push-ups'])
    assert.equal(result.workouts[0].notes, 'Good workout')
  })
})
