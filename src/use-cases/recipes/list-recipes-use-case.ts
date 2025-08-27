import type { IRecipeRepository } from '@/interfaces/index.ts'
import type { RecipeFilterParams } from '@/types/index.ts'

type Request = RecipeFilterParams

export class ListRecipesUseCase {
  constructor(private recipeRepository: IRecipeRepository) {}

  async execute(params: Request) {
    const recipes = await this.recipeRepository.findMany(params)
    return { recipes }
  }
}
