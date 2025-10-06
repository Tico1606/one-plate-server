import { NotAllowedError, NotFoundError, ValidationError } from '@/errors/index.ts'
import type { RecipeRepository } from '@/interfaces/repositories/index.ts'

export interface UnpublishRecipeRequest {
  recipeId: string
  requesterId: string
  requesterRole?: string
}

export interface UnpublishRecipeResponse {
  message: string
  recipe: {
    id: string
    status: 'DRAFT'
    publishedAt: null
  }
}

export class UnpublishRecipeUseCase {
  constructor(private recipeRepository: RecipeRepository) {}

  async execute(request: UnpublishRecipeRequest): Promise<UnpublishRecipeResponse> {
    // Validações básicas
    if (!request.recipeId) {
      throw new ValidationError('ID da receita é obrigatório')
    }

    if (!request.requesterId) {
      throw new ValidationError('ID do usuário é obrigatório')
    }

    // Buscar a receita
    const recipe = await this.recipeRepository.findById(request.recipeId)

    if (!recipe) {
      throw new NotFoundError('Receita não encontrada')
    }

    // Verificar se o usuário é o autor da receita ou admin
    const isAuthor = recipe.authorId === request.requesterId
    const isAdmin = request.requesterRole === 'ADMIN'

    if (!isAuthor && !isAdmin) {
      throw new NotAllowedError(
        'Apenas o autor da receita ou administradores podem despublicá-la',
      )
    }

    // Verificar se a receita já está como rascunho
    if (recipe.status === 'DRAFT') {
      throw new ValidationError('Receita já está como rascunho')
    }

    // Atualizar o status para DRAFT e limpar publishedAt
    const updatedRecipe = await this.recipeRepository.update(request.recipeId, {
      status: 'DRAFT',
      publishedAt: null,
    })

    return {
      message: 'Receita despublicada com sucesso',
      recipe: {
        id: updatedRecipe.id,
        status: 'DRAFT',
        publishedAt: null,
      },
    }
  }
}
