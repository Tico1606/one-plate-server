import { NotFoundError } from '@/errors/index.ts'
import type { RecipeRepository } from '@/interfaces/repositories/index.ts'
import type { RecipeWithRelations } from '@/types/base/index.ts'

export interface GetRecipeByIdRequest {
  recipeId: string
  userId?: string
}

export interface GetRecipeByIdResponse {
  recipe: RecipeWithRelations
}

export class GetRecipeByIdUseCase {
  constructor(private recipeRepository: RecipeRepository) {}

  async execute(request: GetRecipeByIdRequest): Promise<GetRecipeByIdResponse> {
    const { recipeId, userId } = request

    const recipe = await this.recipeRepository.findByIdWithRelations(recipeId, userId)

    if (!recipe) {
      throw new NotFoundError('Receita não encontrada')
    }

    // Incrementar visualização se usuário estiver logado
    if (userId) {
      await this.recipeRepository.incrementView(recipeId, userId)
    }

    return { recipe }
  }
}
