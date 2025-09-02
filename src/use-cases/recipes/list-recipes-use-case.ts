import type { RecipeRepository } from '@/interfaces/repositories/index.ts'
import type { ListRecipesParams } from '@/interfaces/repositories/recipe-repository.ts'
import type { RecipeWithRelations } from '@/types/base/index.ts'

export interface ListRecipesRequest extends ListRecipesParams {
  userId?: string
}

export interface ListRecipesResponse {
  recipes: RecipeWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class ListRecipesUseCase {
  constructor(private recipeRepository: RecipeRepository) {}

  async execute(request: ListRecipesRequest): Promise<ListRecipesResponse> {
    const { userId, ...params } = request

    // Se for para buscar receitas em destaque, usar método específico
    if (params.featured) {
      const result = await this.recipeRepository.findFeatured(params)
      return {
        ...result,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(result.total / params.limit),
      }
    }

    // Busca normal com relacionamentos
    const result = await this.recipeRepository.listWithRelations(params, userId)

    return {
      ...result,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(result.total / params.limit),
    }
  }
}
