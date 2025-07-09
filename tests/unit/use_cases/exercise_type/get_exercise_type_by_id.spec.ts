import { test } from '@japa/runner'
import { GetExerciseTypeByIdUseCase } from '../../../../app/application/use_cases/exercise_type/get_exercise_type_by_id.js'
import { ExerciseTypeRepository } from '../../../../app/domain/repositories/exercise_type_repository.js'
import { ExerciseType } from '../../../../app/domain/entities/exercise_type.js'

test.group('GetExerciseTypeByIdUseCase', (group) => {
  let getExerciseTypeByIdUseCase: GetExerciseTypeByIdUseCase
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

    getExerciseTypeByIdUseCase = new GetExerciseTypeByIdUseCase(mockExerciseTypeRepository)
  })

  test('should return exercise type details when exercise type exists', async ({ assert }) => {
    const mockExerciseType = new ExerciseType({
      id: '1',
      name: 'Push-ups',
      description: 'Upper body exercise targeting chest and arms',
      difficulty: 'beginner',
      targetMuscles: ['chest', 'triceps', 'shoulders'],
      instructions: [
        'Start in plank position',
        'Lower body to the ground',
        'Push back up',
        'Repeat',
      ],
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-02'),
    })

    mockExerciseTypeRepository.findById = async (id) => {
      return id === '1' ? mockExerciseType : null
    }

    const result = await getExerciseTypeByIdUseCase.execute({
      exerciseTypeId: '1',
    })

    assert.equal(result.exerciseType.id, '1')
    assert.equal(result.exerciseType.name, 'Push-ups')
    assert.equal(result.exerciseType.description, 'Upper body exercise targeting chest and arms')
    assert.equal(result.exerciseType.difficulty, 'beginner')
    assert.deepEqual(result.exerciseType.targetMuscles, ['chest', 'triceps', 'shoulders'])
    assert.deepEqual(result.exerciseType.instructions, [
      'Start in plank position',
      'Lower body to the ground',
      'Push back up',
      'Repeat',
    ])
  })

  test('should throw error when exercise type does not exist', async ({ assert }) => {
    mockExerciseTypeRepository.findById = async () => null

    await assert.rejects(async () => {
      await getExerciseTypeByIdUseCase.execute({
        exerciseTypeId: 'nonexistent',
      })
    }, 'Exercise type not found')
  })

  test('should handle advanced exercise type', async ({ assert }) => {
    const mockExerciseType = new ExerciseType({
      id: '1',
      name: 'Muscle-ups',
      description: 'Advanced compound exercise',
      difficulty: 'advanced',
      targetMuscles: ['chest', 'back', 'arms'],
      instructions: ['Complex instruction set'],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockExerciseTypeRepository.findById = async () => mockExerciseType

    const result = await getExerciseTypeByIdUseCase.execute({
      exerciseTypeId: '1',
    })

    assert.equal(result.exerciseType.difficulty, 'advanced')
    assert.equal(result.exerciseType.name, 'Muscle-ups')
  })
})
