import { test } from '@japa/runner'
import { ApiClient } from '@japa/api-client'

test.group('Challenges endpoints', (group) => {
  let client: ApiClient
  let clientToken: string
  let gymOwnerToken: string

  group.setup(async () => {
    client = new ApiClient()

    await client.post('/api/auth/register').json({
      email: 'client@example.com',
      password: 'password123',
      role: 'client',
    })

    await client.post('/api/auth/register').json({
      email: 'owner@example.com',
      password: 'password123',
      role: 'gym_owner',
    })

    clientToken = 'client-mock-token'
    gymOwnerToken = 'owner-mock-token'
  })

  test('POST /api/challenges should create a new challenge', async ({ assert }) => {
    const response = await client
      .post('/api/challenges')
      .header('authorization', `Bearer ${clientToken}`)
      .json({
        title: 'Test Challenge',
        description: 'A test challenge',
        objectives: ['Complete 10 workouts'],
        exerciseTypes: ['cardio', 'strength'],
        duration: 30,
        difficulty: 'beginner',
      })

    response.assertStatus(201)
    response.assertBodyContains({
      status: 'success',
      data: {
        title: 'Test Challenge',
        difficulty: 'beginner',
      },
    })
  })

  test('POST /api/challenges should return error without authentication', async ({ assert }) => {
    const response = await client.post('/api/challenges').json({
      title: 'Test Challenge',
      description: 'A test challenge',
      objectives: ['Complete 10 workouts'],
      exerciseTypes: ['cardio', 'strength'],
      duration: 30,
      difficulty: 'beginner',
    })

    response.assertStatus(401)
  })

  test('POST /api/challenges should return error for invalid difficulty', async ({ assert }) => {
    const response = await client
      .post('/api/challenges')
      .header('authorization', `Bearer ${clientToken}`)
      .json({
        title: 'Test Challenge',
        description: 'A test challenge',
        objectives: ['Complete 10 workouts'],
        exerciseTypes: ['cardio', 'strength'],
        duration: 30,
        difficulty: 'invalid',
      })

    response.assertStatus(400)
  })

  test('POST /api/challenges/:id/join should allow user to join challenge', async ({ assert }) => {
    const createResponse = await client
      .post('/api/challenges')
      .header('authorization', `Bearer ${gymOwnerToken}`)
      .json({
        title: 'Join Test Challenge',
        description: 'A challenge to join',
        objectives: ['Complete 5 workouts'],
        exerciseTypes: ['cardio'],
        duration: 14,
        difficulty: 'beginner',
      })

    const challengeId = 'mock-challenge-id'

    const joinResponse = await client
      .post(`/api/challenges/${challengeId}/join`)
      .header('authorization', `Bearer ${clientToken}`)

    joinResponse.assertStatus(201)
    joinResponse.assertBodyContains({
      status: 'success',
    })
  })
})
