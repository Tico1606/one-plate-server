import { NotAllowedError, NotFoundError } from '@/errors/index.ts'
import type { RecipeRepository } from '@/interfaces/repositories/index.ts'
import { toRecipeDTO } from '@/types/converters.ts'
import type { RecipeDTO } from '@/types/dtos.ts'
import { buildRecipePdf } from '@/utils/pdf/recipe-pdf-builder.ts'

export interface GenerateRecipePdfRequest {
  recipeId: string
  requesterId?: string
  requesterRole?: 'USER' | 'ADMIN'
}

export interface GenerateRecipePdfResponse {
  recipe: RecipeDTO
  buffer: Buffer
  filename: string
}

export class GenerateRecipePdfUseCase {
  constructor(private recipeRepository: RecipeRepository) {}

  async execute(request: GenerateRecipePdfRequest): Promise<GenerateRecipePdfResponse> {
    const { recipeId, requesterId, requesterRole } = request

    const recipe = await this.recipeRepository.findByIdWithRelations(recipeId, requesterId)

    if (!recipe) {
      throw new NotFoundError('Receita nao encontrada')
    }

    if (recipe.status === 'DRAFT') {
      const isAuthor = requesterId && requesterId === recipe.authorId
      const isAdmin = requesterRole === 'ADMIN'

      if (!isAuthor && !isAdmin) {
        throw new NotAllowedError('Esta receita e privada')
      }
    }

    const recipeDTO = toRecipeDTO(recipe)
    const { buffer, filename } = buildRecipePdf(recipeDTO)

    return {
      recipe: recipeDTO,
      buffer,
      filename,
    }
  }
}
