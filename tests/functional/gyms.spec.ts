import { test } from '@japa/runner'
import { ApiClient } from '@japa/api-client'

test.group('Gyms endpoints', (group) => {
  let client: ApiClient
  let authToken: string

  group.setup(async () => {
    client = new ApiClient()

    await client.post('/api/auth/register').json({
      email: 'gymowner@example.com',
      password: 'password123',
      role: 'gym_owner',
    })

    const loginResponse = await client.post('/api/auth/login').json({
      email: 'gymowner@example.com',
      password: 'password123',
    })

    authToken = 'mock-token'
  })

  test('POST /api/gyms should create a new gym for gym owner', async ({ assert }) => {
    const response = await client
      .post('/api/gyms')
      .header('authorization', `Bearer ${authToken}`)
      .json({
        name: 'Test Gym',
        address: '123 Test Street',
        contact: 'test@gym.com',
        description: 'A test gym',
        capacity: 100,
        equipment: ['treadmill', 'weights'],
        activities: ['cardio', 'strength'],
      })

    response.assertStatus(201)
    response.assertBodyContains({
      status: 'success',
      data: {
        name: 'Test Gym',
        address: '123 Test Street',
        status: 'pending',
      },
    })
  })

  test('POST /api/gyms should return error without authentication', async ({ assert }) => {
    const response = await client.post('/api/gyms').json({
      name: 'Test Gym',
      address: '123 Test Street',
      contact: 'test@gym.com',
      description: 'A test gym',
      capacity: 100,
      equipment: ['treadmill', 'weights'],
      activities: ['cardio', 'strength'],
    })

    response.assertStatus(401)
  })

  test('GET /api/gyms/pending should return pending gyms for super admin', async ({ assert }) => {
    await client.post('/api/auth/register').json({
      email: 'admin@example.com',
      password: 'password123',
      role: 'super_admin',
    })

    const adminLoginResponse = await client.post('/api/auth/login').json({
      email: 'admin@example.com',
      password: 'password123',
    })

    const adminToken = 'admin-mock-token'

    const response = await client
      .get('/api/gyms/pending')
      .header('authorization', `Bearer ${adminToken}`)

    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
      data: {
        gyms: [],
        total: 0,
      },
    })
  })
})
