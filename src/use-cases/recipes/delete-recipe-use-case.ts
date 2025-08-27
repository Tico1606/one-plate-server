import { NotFoundError } from '@/errors/index.ts'
import type { IRecipeRepository } from '@/interfaces/index.ts'

type Request = {
  recipeId: string
}

export class DeleteRecipeUseCase {
  constructor(private recipeRepository: IRecipeRepository) {}

  async execute({ recipeId }: Request) {
    const existingRecipe = await this.recipeRepository.findById(recipeId)

    if (!existingRecipe) {
      throw new NotFoundError("Recipe doesn't exist")
    }

    await this.recipeRepository.delete(recipeId)
  }
}
