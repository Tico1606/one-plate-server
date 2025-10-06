import { NotAllowedError, NotFoundError } from '@/errors/index.ts'
import type { RecipeRepository } from '@/interfaces/repositories/index.ts'
import { toRecipeDTO } from '@/types/converters.ts'
import type { RecipeDTO } from '@/types/dtos.ts'

export interface GetRecipeByIdRequest {
  recipeId: string
  userId?: string
}

export interface GetRecipeByIdResponse {
  recipe: RecipeDTO
}

export class GetRecipeByIdUseCase {
  constructor(private recipeRepository: RecipeRepository) {}

  async execute(request: GetRecipeByIdRequest): Promise<GetRecipeByIdResponse> {
    const { recipeId, userId } = request

    const recipe = await this.recipeRepository.findByIdWithRelations(recipeId, userId)

    if (!recipe) {
      throw new NotFoundError('Receita não encontrada')
    }

    // Verificar permissões baseado no status da receita
    // Se é DRAFT, apenas o autor pode ver
    if (recipe.status === 'DRAFT') {
      const isAuthor = recipe.authorId === userId
      const isAdmin = false // TODO: verificar se é admin quando necessário

      if (!isAuthor && !isAdmin) {
        throw new NotAllowedError('Esta receita é privada')
      }
    }

    // Incrementar visualização se usuário estiver logado
    if (userId) {
      await this.recipeRepository.incrementView(recipeId, userId)
    }

    return { recipe: toRecipeDTO(recipe) }
  }
}
