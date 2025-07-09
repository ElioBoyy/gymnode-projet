import { HttpContext } from '@adonisjs/core/http'
import { MongoDBExerciseTypeRepository } from '../infrastructure/repositories/mongodb_exercise_type_repository.js'
import { inject } from '@adonisjs/core'

@inject()
export default class ExerciseTypesController {
  private exerciseTypeRepository = new MongoDBExerciseTypeRepository()

  async index({ response }: HttpContext) {
    try {
      const exerciseTypes = await this.exerciseTypeRepository.findAll()

      return response.json({
        status: 'success',
        data: exerciseTypes.map((exerciseType) => ({
          id: exerciseType.id,
          name: exerciseType.name,
          description: exerciseType.description,
          targetMuscles: exerciseType.targetMuscles,
          difficulty: exerciseType.difficulty,
        })),
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Failed to fetch exercise types',
      })
    }
  }

  async show({ params, response }: HttpContext) {
    try {
      const exerciseType = await this.exerciseTypeRepository.findById(params.id)

      if (!exerciseType) {
        return response.status(404).json({
          status: 'error',
          message: 'Exercise type not found',
        })
      }

      return response.json({
        status: 'success',
        data: {
          id: exerciseType.id,
          name: exerciseType.name,
          description: exerciseType.description,
          targetMuscles: exerciseType.targetMuscles,
          difficulty: exerciseType.difficulty,
          createdAt: exerciseType.createdAt,
          updatedAt: exerciseType.updatedAt,
        },
      })
    } catch (error) {
      return response.status(500).json({
        status: 'error',
        message: 'Failed to fetch exercise type',
      })
    }
  }
}
