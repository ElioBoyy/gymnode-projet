import { test } from '@japa/runner'
import { ApiClient } from '@japa/api-client'

test.group('Auth endpoints', (group) => {
  let client: ApiClient

  group.setup(() => {
    client = new ApiClient()
  })

  test('POST /api/auth/register should create a new user', async ({ assert }) => {
    const response = await client.post('/api/auth/register').json({
      email: 'test@example.com',
      password: 'password123',
      role: 'client',
    })

    response.assertStatus(201)
    response.assertBodyContains({
      status: 'success',
      data: {
        email: 'test@example.com',
        role: 'client',
        isActive: true,
      },
    })
  })

  test('POST /api/auth/register should return error for invalid email', async ({ assert }) => {
    const response = await client.post('/api/auth/register').json({
      email: 'invalid-email',
      password: 'password123',
      role: 'client',
    })

    response.assertStatus(400)
  })

  test('POST /api/auth/register should return error for short password', async ({ assert }) => {
    const response = await client.post('/api/auth/register').json({
      email: 'test2@example.com',
      password: '123',
      role: 'client',
    })

    response.assertStatus(400)
  })

  test('POST /api/auth/login should authenticate user with valid credentials', async ({
    assert,
  }) => {
    await client.post('/api/auth/register').json({
      email: 'login@example.com',
      password: 'password123',
      role: 'client',
    })

    const response = await client.post('/api/auth/login').json({
      email: 'login@example.com',
      password: 'password123',
    })

    response.assertStatus(200)
    response.assertBodyContains({
      status: 'success',
      data: {
        email: 'login@example.com',
        role: 'client',
      },
    })
  })

  test('POST /api/auth/login should return error for invalid credentials', async ({ assert }) => {
    const response = await client.post('/api/auth/login').json({
      email: 'nonexistent@example.com',
      password: 'wrongpassword',
    })

    response.assertStatus(401)
    response.assertBodyContains({
      status: 'error',
    })
  })
})
