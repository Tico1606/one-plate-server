import { NotFoundError } from '@/errors/index.ts'
import type { IRecipeRepository } from '@/interfaces/index.ts'

type Request = {
  recipeId: string
}

export class GetRecipeByIdUseCase {
  constructor(private recipeRepository: IRecipeRepository) {}

  async execute({ recipeId }: Request) {
    const recipe = await this.recipeRepository.findById(recipeId)

    if (!recipe) {
      throw new NotFoundError("Recipe doesn't exist")
    }

    return { recipe }
  }
}
