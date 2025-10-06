import { NotAllowedError, NotFoundError, ValidationError } from '@/errors/index.ts'
import type { RecipeRepository } from '@/interfaces/repositories/index.ts'

export interface PublishRecipeRequest {
  recipeId: string
  requesterId: string
  requesterRole?: string
}

export interface PublishRecipeResponse {
  message: string
  recipe: {
    id: string
    status: 'PUBLISHED'
    publishedAt: Date
  }
}

export class PublishRecipeUseCase {
  constructor(private recipeRepository: RecipeRepository) {}

  async execute(request: PublishRecipeRequest): Promise<PublishRecipeResponse> {
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
        'Apenas o autor da receita ou administradores podem publicá-la',
      )
    }

    // Verificar se a receita já está publicada
    if (recipe.status === 'PUBLISHED') {
      throw new ValidationError('Receita já está publicada')
    }

    // Atualizar o status para PUBLISHED e definir publishedAt
    const updatedRecipe = await this.recipeRepository.update(request.recipeId, {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    })

    return {
      message: 'Receita publicada com sucesso',
      recipe: {
        id: updatedRecipe.id,
        status: 'PUBLISHED' as const,
        publishedAt: updatedRecipe.publishedAt || new Date(),
      },
    }
  }
}
