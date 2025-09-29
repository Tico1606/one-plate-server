import { NotFoundError } from '@/errors/not-found-error.ts'
import type { IngredientRepository } from '@/interfaces/repositories/index.ts'

export interface DeleteIngredientRequest {
  ingredientId: string
}

export class DeleteIngredientUseCase {
  constructor(private ingredientRepository: IngredientRepository) {}

  async execute(request: DeleteIngredientRequest): Promise<void> {
    const { ingredientId } = request

    // Verificar se o ingrediente existe
    const exists = await this.ingredientRepository.exists(ingredientId)
    if (!exists) {
      throw new NotFoundError('Ingrediente não encontrado')
    }

    await this.ingredientRepository.delete(ingredientId)
  }
}
