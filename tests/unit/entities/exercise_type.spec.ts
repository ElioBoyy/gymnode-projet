import { test } from '@japa/runner'
import { ExerciseType } from '../../../app/domain/entities/exercise_type.js'

test.group('ExerciseType Entity', (group) => {
  test('should create an exercise type with default values', async ({ assert }) => {
    const exerciseType = new ExerciseType({
      id: '1',
      name: 'Push-ups',
      description: 'Classic upper body exercise',
      targetMuscles: ['chest', 'shoulders', 'triceps'],
      difficulty: 'beginner',
    })

    assert.equal(exerciseType.id, '1')
    assert.equal(exerciseType.name, 'Push-ups')
    assert.equal(exerciseType.description, 'Classic upper body exercise')
    assert.deepEqual(exerciseType.targetMuscles, ['chest', 'shoulders', 'triceps'])
    assert.equal(exerciseType.difficulty, 'beginner')
    assert.instanceOf(exerciseType.createdAt, Date)
    assert.instanceOf(exerciseType.updatedAt, Date)
  })

  test('should create an exercise type with custom dates', async ({ assert }) => {
    const createdAt = new Date('2023-01-01')
    const updatedAt = new Date('2023-01-02')

    const exerciseType = new ExerciseType({
      id: '2',
      name: 'Squats',
      description: 'Lower body compound exercise',
      targetMuscles: ['quadriceps', 'glutes', 'hamstrings'],
      difficulty: 'intermediate',
      createdAt,
      updatedAt,
    })

    assert.equal(exerciseType.name, 'Squats')
    assert.equal(exerciseType.difficulty, 'intermediate')
    assert.equal(exerciseType.createdAt, createdAt)
    assert.equal(exerciseType.updatedAt, updatedAt)
  })

  test('should update description', async ({ assert }) => {
    const exerciseType = new ExerciseType({
      id: '1',
      name: 'Burpees',
      description: 'Full body exercise',
      targetMuscles: ['full-body'],
      difficulty: 'advanced',
    })

    const updatedExerciseType = exerciseType.updateDescription('High-intensity full body movement')

    assert.equal(exerciseType.description, 'Full body exercise') // Original unchanged
    assert.equal(updatedExerciseType.description, 'High-intensity full body movement')
    assert.isTrue(updatedExerciseType.updatedAt > exerciseType.updatedAt)
  })

  test('should add target muscle', async ({ assert }) => {
    const exerciseType = new ExerciseType({
      id: '1',
      name: 'Plank',
      description: 'Core strengthening exercise',
      targetMuscles: ['core'],
      difficulty: 'beginner',
    })

    const updatedExerciseType = exerciseType.addTargetMuscle('shoulders')

    assert.deepEqual(exerciseType.targetMuscles, ['core']) // Original unchanged
    assert.deepEqual(updatedExerciseType.targetMuscles, ['core', 'shoulders'])
    assert.isTrue(updatedExerciseType.updatedAt > exerciseType.updatedAt)
  })

  test('should not add duplicate target muscle', async ({ assert }) => {
    const exerciseType = new ExerciseType({
      id: '1',
      name: 'Pull-ups',
      description: 'Upper body pulling exercise',
      targetMuscles: ['back', 'biceps'],
      difficulty: 'intermediate',
    })

    const unchangedExerciseType = exerciseType.addTargetMuscle('back')

    // Should return the same instance if muscle already exists
    assert.equal(exerciseType, unchangedExerciseType)
    assert.deepEqual(unchangedExerciseType.targetMuscles, ['back', 'biceps'])
  })

  test('should handle different difficulty levels', async ({ assert }) => {
    const beginnerExercise = new ExerciseType({
      id: '1',
      name: 'Wall Push-ups',
      description: 'Beginner-friendly push-ups',
      targetMuscles: ['chest'],
      difficulty: 'beginner',
    })

    const intermediateExercise = new ExerciseType({
      id: '2',
      name: 'Regular Push-ups',
      description: 'Standard push-ups',
      targetMuscles: ['chest', 'shoulders'],
      difficulty: 'intermediate',
    })

    const advancedExercise = new ExerciseType({
      id: '3',
      name: 'One-arm Push-ups',
      description: 'Advanced push-up variation',
      targetMuscles: ['chest', 'shoulders', 'core'],
      difficulty: 'advanced',
    })

    assert.equal(beginnerExercise.difficulty, 'beginner')
    assert.equal(intermediateExercise.difficulty, 'intermediate')
    assert.equal(advancedExercise.difficulty, 'advanced')
  })
})
