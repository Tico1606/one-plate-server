import { NotFoundError } from '@/errors/not-found-error.ts'
import type { IngredientRepository } from '@/interfaces/repositories/index.ts'

export interface GetIngredientByIdRequest {
  ingredientId: string
}

export interface GetIngredientByIdResponse {
  ingredient: {
    id: string
    name: string
    description?: string | null
    imageUrl?: string | null
  }
}

export class GetIngredientByIdUseCase {
  constructor(private ingredientRepository: IngredientRepository) {}

  async execute(request: GetIngredientByIdRequest): Promise<GetIngredientByIdResponse> {
    const ingredient = await this.ingredientRepository.findById(request.ingredientId)

    if (!ingredient) {
      throw new NotFoundError('Ingrediente não encontrado')
    }

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
