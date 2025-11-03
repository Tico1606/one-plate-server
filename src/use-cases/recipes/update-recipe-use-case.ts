import { NotAllowedError, NotFoundError } from '@/errors/index.ts'
import type { RecipeRepository } from '@/interfaces/repositories/index.ts'
import type { UpdateRecipeData } from '@/interfaces/repositories/recipe-repository.ts'
import { toRecipeDTO } from '@/types/converters.ts'
import type { RecipeDTO } from '@/types/dtos.ts'
import { processNutritionalFields } from '@/utils/nutrition-processor.ts'

export interface UpdateRecipeRequest extends UpdateRecipeData {
  recipeId: string
  requesterId: string
  requesterRole?: 'USER' | 'ADMIN'
}

export interface UpdateRecipeResponse {
  recipe: RecipeDTO
}

export class UpdateRecipeUseCase {
  constructor(private recipeRepository: RecipeRepository) {}

  async execute(request: UpdateRecipeRequest): Promise<UpdateRecipeResponse> {
    const { recipeId, requesterId, requesterRole, ...updateData } = request

    // Processar campos nutricionais (substituir vazios por "-")
    const processedUpdateData = processNutritionalFields(updateData)

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

    await this.recipeRepository.update(recipeId, processedUpdateData)

    // Buscar a receita atualizada com todos os relacionamentos para converter para DTO
    const recipeWithRelations = await this.recipeRepository.findByIdWithRelations(
      recipeId,
      requesterId,
    )
    if (!recipeWithRelations) {
      throw new Error('Erro ao buscar receita atualizada')
    }

    return { recipe: toRecipeDTO(recipeWithRelations) }
  }
}
