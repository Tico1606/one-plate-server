import { NotFoundError } from '@/errors/index.ts'
import type { IRecipeRepository } from '@/interfaces/index.ts'
import type { RecipeUpdateParams } from '@/types/index.ts'

type Request = {
  recipeId: string
  recipeDto: Partial<RecipeUpdateParams>
}

export class UpdateRecipeUseCase {
  constructor(private recipeRepository: IRecipeRepository) {}

  async execute({ recipeId, recipeDto }: Request) {
    const existingRecipe = await this.recipeRepository.findById(recipeId)

    if (!existingRecipe) {
      throw new NotFoundError("Recipe doesn't exist")
    }

    const recipe = await this.recipeRepository.update(recipeDto, recipeId)
    return { recipe }
  }
}
