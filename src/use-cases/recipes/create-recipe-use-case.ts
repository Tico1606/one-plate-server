import { ConflictError } from '@/errors/index.ts'
import type { IRecipeRepository } from '@/interfaces/index.ts'
import type { RecipeCreateParams } from '@/types/index.ts'

type Request = {
  recipeDto: RecipeCreateParams
}

export class CreateRecipeUseCase {
  constructor(private recipeRepository: IRecipeRepository) {}

  async execute({ recipeDto }: Request) {
    const existingRecipe = await this.recipeRepository.findByTitle(recipeDto.title)

    if (existingRecipe) {
      throw new ConflictError('Already exists a recipe with this title')
    }

    const recipe = await this.recipeRepository.create(recipeDto)

    return { recipe }
  }
}
