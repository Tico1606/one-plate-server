import type { RecipeRepository } from '@/interfaces/repositories/index.ts'
import type { ListRecipesParams } from '@/interfaces/repositories/recipe-repository.ts'
import { toRecipeListItemDTO } from '@/types/converters.ts'
import type { RecipeListItemDTO } from '@/types/dtos.ts'

export interface ListRecipesRequest extends ListRecipesParams {
  userId?: string
}

export interface ListRecipesResponse {
  recipes: RecipeListItemDTO[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class ListRecipesUseCase {
  constructor(private recipeRepository: RecipeRepository) {}

  async execute(request: ListRecipesRequest): Promise<ListRecipesResponse> {
    const { userId, ...params } = request

    console.log('🔍 [LIST RECIPES DEBUG] Params recebidos:', params)

    // Se for para buscar receitas em destaque, usar método específico
    if (params.featured) {
      const result = await this.recipeRepository.findFeatured(params)
      console.log('🔍 [LIST RECIPES DEBUG] Featured result:', {
        total: result.total,
        recipesCount: result.recipes.length,
      })
      return {
        recipes: result.recipes.map(toRecipeListItemDTO),
        total: result.total,
        page: params.page,
        limit: params.limit,
        totalPages: Math.ceil(result.total / params.limit),
      }
    }

    // Busca normal com relacionamentos
    const result = await this.recipeRepository.listWithRelations(params, userId)
    console.log('🔍 [LIST RECIPES DEBUG] Result:', {
      total: result.total,
      recipesCount: result.recipes.length,
    })

    return {
      recipes: result.recipes.map(toRecipeListItemDTO),
      total: result.total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(result.total / params.limit),
    }
  }
}
