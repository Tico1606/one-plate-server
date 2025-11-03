import { ValidationError } from '@/errors/validation-error.ts'
import type { IngredientRepository } from '@/interfaces/repositories/index.ts'
import type { CreateIngredientData } from '@/interfaces/repositories/ingredient-repository.ts'

export interface CreateIngredientRequest extends CreateIngredientData {}

export interface CreateIngredientResponse {
  ingredient: {
    id: string
    name: string
    description?: string | null
    imageUrl?: string | null
  }
}

export class CreateIngredientUseCase {
  constructor(private ingredientRepository: IngredientRepository) {}

  async execute(request: CreateIngredientRequest): Promise<CreateIngredientResponse> {
    // Validar se o nome não está vazio
    if (!request.name || request.name.trim().length === 0) {
      throw new ValidationError('Nome do ingrediente é obrigatório')
    }

    const ingredient = await this.ingredientRepository.create({
      name: request.name.trim(),
      description: request.description?.trim() || undefined,
      imageUrl: request.imageUrl?.trim() || undefined,
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
