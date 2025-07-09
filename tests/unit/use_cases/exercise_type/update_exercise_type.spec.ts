import { test } from '@japa/runner'
import { UpdateExerciseTypeUseCase } from '../../../../app/application/use_cases/exercise_type/update_exercise_type.js'
import { ExerciseTypeRepository } from '../../../../app/domain/repositories/exercise_type_repository.js'
import { ExerciseType } from '../../../../app/domain/entities/exercise_type.js'

test.group('UpdateExerciseTypeUseCase', (group) => {
  let updateExerciseTypeUseCase: UpdateExerciseTypeUseCase
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

    updateExerciseTypeUseCase = new UpdateExerciseTypeUseCase(mockExerciseTypeRepository)
  })

  test('should update exercise type successfully', async ({ assert }) => {
    const mockExerciseType = new ExerciseType({
      id: '1',
      name: 'Original Name',
      description: 'Original Description',
      difficulty: 'beginner',
      targetMuscles: ['chest'],
      instructions: ['Original instruction'],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockExerciseTypeRepository.findById = async () => mockExerciseType
    mockExerciseTypeRepository.save = async (exerciseType) => {}

    const result = await updateExerciseTypeUseCase.execute({
      exerciseTypeId: '1',
      name: 'Updated Name',
      description: 'Updated Description',
      difficulty: 'intermediate',
      targetMuscles: ['chest', 'shoulders'],
      instructions: ['Updated instruction 1', 'Updated instruction 2'],
    })

    assert.equal(result.exerciseType.name, 'Updated Name')
    assert.equal(result.exerciseType.description, 'Updated Description')
    assert.equal(result.exerciseType.difficulty, 'intermediate')
    assert.deepEqual(result.exerciseType.targetMuscles, ['chest', 'shoulders'])
    assert.deepEqual(result.exerciseType.instructions, [
      'Updated instruction 1',
      'Updated instruction 2',
    ])
  })

  test('should throw error when exercise type does not exist', async ({ assert }) => {
    mockExerciseTypeRepository.findById = async () => null

    await assert.rejects(async () => {
      await updateExerciseTypeUseCase.execute({
        exerciseTypeId: 'nonexistent',
        name: 'Updated Name',
      })
    }, 'Exercise type not found')
  })

  test('should update only provided fields', async ({ assert }) => {
    const mockExerciseType = new ExerciseType({
      id: '1',
      name: 'Original Name',
      description: 'Original Description',
      difficulty: 'beginner',
      targetMuscles: ['chest'],
      instructions: ['Original instruction'],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockExerciseTypeRepository.findById = async () => mockExerciseType
    mockExerciseTypeRepository.save = async (exerciseType) => {}

    const result = await updateExerciseTypeUseCase.execute({
      exerciseTypeId: '1',
      name: 'Updated Name Only',
    })

    assert.equal(result.exerciseType.name, 'Updated Name Only')
    assert.equal(result.exerciseType.description, 'Original Description')
    assert.equal(result.exerciseType.difficulty, 'beginner')
    assert.deepEqual(result.exerciseType.targetMuscles, ['chest'])
  })
})
