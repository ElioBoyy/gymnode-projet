import { test } from '@japa/runner'
import { DeleteExerciseTypeUseCase } from '../../../../app/application/use_cases/exercise_type/delete_exercise_type.js'
import { ExerciseTypeRepository } from '../../../../app/domain/repositories/exercise_type_repository.js'
import { ChallengeRepository } from '../../../../app/domain/repositories/challenge_repository.js'
import { ExerciseType } from '../../../../app/domain/entities/exercise_type.js'

test.group('DeleteExerciseTypeUseCase', (group) => {
  let deleteExerciseTypeUseCase: DeleteExerciseTypeUseCase
  let mockExerciseTypeRepository: ExerciseTypeRepository
  let mockChallengeRepository: ChallengeRepository

  group.setup(async () => {
    mockExerciseTypeRepository = {
      findAll: async () => [],
      findById: async () => null,
      findByDifficulty: async () => [],
      findByName: async () => null,
      save: async () => {},
      delete: async () => {},
    } as ExerciseTypeRepository

    mockChallengeRepository = {
      findAll: async () => [],
      findById: async () => null,
      findByCreatorId: async () => [],
      findByStatus: async () => [],
      findByGymId: async () => [],
      save: async () => {},
      delete: async () => {},
    } as ChallengeRepository

    deleteExerciseTypeUseCase = new DeleteExerciseTypeUseCase(
      mockExerciseTypeRepository,
      mockChallengeRepository
    )
  })

  test('should delete exercise type successfully when not used in challenges', async ({
    assert,
  }) => {
    const mockExerciseType = new ExerciseType({
      id: '1',
      name: 'Test Exercise',
      description: 'Test Description',
      difficulty: 'beginner',
      targetMuscles: ['chest'],
      instructions: ['Test instruction'],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    mockExerciseTypeRepository.findById = async () => mockExerciseType
    mockChallengeRepository.findAll = async () => []
    mockExerciseTypeRepository.delete = async (exerciseTypeId) => {
      assert.equal(exerciseTypeId, '1')
    }

    await deleteExerciseTypeUseCase.execute({
      exerciseTypeId: '1',
    })
  })

  test('should throw error when exercise type does not exist', async ({ assert }) => {
    mockExerciseTypeRepository.findById = async () => null

    await assert.rejects(async () => {
      await deleteExerciseTypeUseCase.execute({
        exerciseTypeId: 'nonexistent',
      })
    }, 'Exercise type not found')
  })

  test('should throw error when exercise type is used in challenges', async ({ assert }) => {
    const mockExerciseType = new ExerciseType({
      id: '1',
      name: 'Test Exercise',
      description: 'Test Description',
      difficulty: 'beginner',
      targetMuscles: ['chest'],
      instructions: ['Test instruction'],
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    const mockChallenges = [
      {
        id: '1',
        exerciseTypes: ['Test Exercise'],
      },
    ] as any

    mockExerciseTypeRepository.findById = async () => mockExerciseType
    mockChallengeRepository.findAll = async () => mockChallenges

    await assert.rejects(async () => {
      await deleteExerciseTypeUseCase.execute({
        exerciseTypeId: '1',
      })
    }, 'Cannot delete exercise type that is used in challenges')
  })
})
