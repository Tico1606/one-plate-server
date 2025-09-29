import { NotFoundError, ValidationError } from '@/errors/index.ts'
import type { IngredientRepository } from '@/interfaces/repositories/index.ts'
import type { UpdateIngredientData } from '@/interfaces/repositories/ingredient-repository.ts'

export interface UpdateIngredientRequest extends UpdateIngredientData {
  ingredientId: string
}

export interface UpdateIngredientResponse {
  ingredient: {
    id: string
    name: string
    description?: string | null
    imageUrl?: string | null
  }
}

export class UpdateIngredientUseCase {
  constructor(private ingredientRepository: IngredientRepository) {}

  async execute(request: UpdateIngredientRequest): Promise<UpdateIngredientResponse> {
    const { ingredientId, ...data } = request

    // Verificar se o ingrediente existe
    const existingIngredient = await this.ingredientRepository.findById(ingredientId)
    if (!existingIngredient) {
      throw new NotFoundError('Ingrediente não encontrado')
    }

    // Validar nome se fornecido
    if (data.name !== undefined) {
      if (!data.name || data.name.trim().length === 0) {
        throw new ValidationError('Nome do ingrediente é obrigatório')
      }

      // Verificar se já existe outro ingrediente com esse nome
      const ingredientWithSameName = await this.ingredientRepository.findByName(
        data.name.trim(),
      )
      if (ingredientWithSameName && ingredientWithSameName.id !== ingredientId) {
        throw new ValidationError('Já existe um ingrediente com esse nome')
      }
    }

    const ingredient = await this.ingredientRepository.update(ingredientId, {
      name: data.name?.trim(),
      description: data.description?.trim() || undefined,
      imageUrl: data.imageUrl?.trim() || undefined,
    })

    return {
      ingredient: {
        id: ingredient.id,
        name: ingredient.name,
        description: ingredient.description,
        imageUrl: ingredient.imageUrl,
      },
    }
  }
}
