import type { IngredientRepository } from '@/interfaces/repositories/index.ts'
import type { ListIngredientsParams } from '@/interfaces/repositories/ingredient-repository.ts'

export interface ListIngredientsRequest extends ListIngredientsParams {}

export interface ListIngredientsResponse {
  ingredients: Array<{
    id: string
    name: string
    description?: string | null
    imageUrl?: string | null
  }>
  total: number
  page: number
  limit: number
  totalPages: number
}

export class ListIngredientsUseCase {
  constructor(private ingredientRepository: IngredientRepository) {}

  async execute(request: ListIngredientsRequest): Promise<ListIngredientsResponse> {
    const { page = 1, limit = 20, ...params } = request

    const result = await this.ingredientRepository.list({
      ...params,
      page,
      limit,
    })

    return {
      ingredients: result.ingredients.map((ingredient) => ({
        id: ingredient.id,
        name: ingredient.name,
        description: ingredient.description,
        imageUrl: ingredient.imageUrl,
      })),
      total: result.total,
      page,
      limit,
      totalPages: Math.ceil(result.total / limit),
    }
  }
}
