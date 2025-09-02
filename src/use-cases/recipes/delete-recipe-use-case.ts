import { NotAllowedError, NotFoundError } from '@/errors/index.ts'
import type { RecipeRepository } from '@/interfaces/repositories/index.ts'

export interface DeleteRecipeRequest {
  recipeId: string
  requesterId: string
  requesterRole?: 'USER' | 'ADMIN'
}

export class DeleteRecipeUseCase {
  constructor(private recipeRepository: RecipeRepository) {}

  async execute(request: DeleteRecipeRequest): Promise<void> {
    const { recipeId, requesterId, requesterRole } = request

    const existingRecipe = await this.recipeRepository.findById(recipeId)

    if (!existingRecipe) {
      throw new NotFoundError('Receita não encontrada')
    }

    // Verificar permissões: ADMIN pode deletar qualquer receita, USER só pode deletar suas próprias
    const isAdmin = requesterRole === 'ADMIN'
    const isAuthor = existingRecipe.authorId === requesterId

    if (!isAdmin && !isAuthor) {
      throw new NotAllowedError('Você só pode deletar suas próprias receitas')
    }

    await this.recipeRepository.delete(recipeId)
  }
}
