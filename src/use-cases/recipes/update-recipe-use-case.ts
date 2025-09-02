import { NotAllowedError, NotFoundError } from '@/errors/index.ts'
import type { RecipeRepository } from '@/interfaces/repositories/index.ts'
import type { UpdateRecipeData } from '@/interfaces/repositories/recipe-repository.ts'
import type { BaseRecipe } from '@/types/base/index.ts'

export interface UpdateRecipeRequest extends UpdateRecipeData {
  recipeId: string
  requesterId: string
  requesterRole?: 'USER' | 'ADMIN'
}

export interface UpdateRecipeResponse {
  recipe: BaseRecipe
}

export class UpdateRecipeUseCase {
  constructor(private recipeRepository: RecipeRepository) {}

  async execute(request: UpdateRecipeRequest): Promise<UpdateRecipeResponse> {
    const { recipeId, requesterId, requesterRole, ...updateData } = request

    const existingRecipe = await this.recipeRepository.findById(recipeId)

    if (!existingRecipe) {
      throw new NotFoundError('Receita não encontrada')
    }

    // Verificar permissões: ADMIN pode editar qualquer receita, USER só pode editar suas próprias
    const isAdmin = requesterRole === 'ADMIN'
    const isAuthor = existingRecipe.authorId === requesterId

    if (!isAdmin && !isAuthor) {
      throw new NotAllowedError('Você só pode editar suas próprias receitas')
    }

    const updatedRecipe = await this.recipeRepository.update(recipeId, updateData)

    return { recipe: updatedRecipe }
  }
}
