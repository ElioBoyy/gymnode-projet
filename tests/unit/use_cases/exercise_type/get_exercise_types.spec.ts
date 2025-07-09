import { test } from '@japa/runner'
import { GetExerciseTypesUseCase } from '../../../../app/application/use_cases/exercise_type/get_exercise_types.js'
import { ExerciseTypeRepository } from '../../../../app/domain/repositories/exercise_type_repository.js'
import { ExerciseType } from '../../../../app/domain/entities/exercise_type.js'

test.group('GetExerciseTypesUseCase', (group) => {
  let getExerciseTypesUseCase: GetExerciseTypesUseCase
  let mockExerciseTypeRepository: ExerciseTypeRepository

  group.setup(async () => {
    mockExerciseTypeRepository = {
      findAll: async () => [],
      findById: async () => null,
      findByDifficulty: async () => [],
      findByName: async () => null,
      save: async () => {},
      delete: async () => {},
    } as ExerciseTypeRepository

    getExerciseTypesUseCase = new GetExerciseTypesUseCase(mockExerciseTypeRepository)
  })

  test('should return paginated exercise types with default pagination', async ({ assert }) => {
    const mockExerciseTypes = [
      new ExerciseType({
        id: '1',
        name: 'Push-ups',
        description: 'Upper body exercise',
        difficulty: 'beginner',
        targetMuscles: ['chest', 'arms'],
        instructions: ['Step 1', 'Step 2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new ExerciseType({
        id: '2',
        name: 'Squats',
        description: 'Lower body exercise',
        difficulty: 'intermediate',
        targetMuscles: ['legs', 'glutes'],
        instructions: ['Step 1', 'Step 2'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]

    mockExerciseTypeRepository.findAll = async () => mockExerciseTypes

    const result = await getExerciseTypesUseCase.execute({})

    assert.equal(result.exerciseTypes.length, 2)
    assert.equal(result.pagination.page, 1)
    assert.equal(result.pagination.limit, 20)
    assert.equal(result.pagination.total, 2)
    assert.equal(result.pagination.totalPages, 1)
  })

  test('should filter exercise types by difficulty', async ({ assert }) => {
    const mockExerciseTypes = [
      new ExerciseType({
        id: '1',
        name: 'Push-ups',
        description: 'Upper body exercise',
        difficulty: 'beginner',
        targetMuscles: ['chest'],
        instructions: ['Step 1'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
      new ExerciseType({
        id: '2',
        name: 'Advanced Squats',
        description: 'Advanced lower body exercise',
        difficulty: 'advanced',
        targetMuscles: ['legs'],
        instructions: ['Step 1'],
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    ]

    mockExerciseTypeRepository.findAll = async () => mockExerciseTypes

    const result = await getExerciseTypesUseCase.execute({
      difficulty: 'beginner',
    })

    assert.equal(result.exerciseTypes.length, 1)
    assert.equal(result.exerciseTypes[0].difficulty, 'beginner')
    assert.equal(result.exerciseTypes[0].name, 'Push-ups')
  })

  test('should handle pagination correctly', async ({ assert }) => {
    const mockExerciseTypes = Array.from(
      { length: 25 },
      (_, i) =>
        new ExerciseType({
          id: `${i + 1}`,
          name: `Exercise ${i + 1}`,
          description: 'Description',
          difficulty: 'beginner',
          targetMuscles: ['muscle'],
          instructions: ['instruction'],
          createdAt: new Date(),
          updatedAt: new Date(),
        })
    )

    mockExerciseTypeRepository.findAll = async () => mockExerciseTypes

    const result = await getExerciseTypesUseCase.execute({
      page: 2,
      limit: 10,
    })

    assert.equal(result.exerciseTypes.length, 10)
    assert.equal(result.pagination.page, 2)
    assert.equal(result.pagination.limit, 10)
    assert.equal(result.pagination.total, 25)
    assert.equal(result.pagination.totalPages, 3)
  })

  test('should return empty array when no exercise types exist', async ({ assert }) => {
    mockExerciseTypeRepository.findAll = async () => []

    const result = await getExerciseTypesUseCase.execute({})

    assert.equal(result.exerciseTypes.length, 0)
    assert.equal(result.pagination.total, 0)
  })
})
