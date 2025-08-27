import type { IRecipeRepository } from '@/interfaces/index.ts'

type Request = {
  title?: string
  category?: string
  authorId?: string
  kcal?: number
  timeToPrepare?: string
  portionsMin?: number
  portionsMax?: number
  page: number
}

export class CreateRecipeUseCase {
  constructor(private recipeRepository: IRecipeRepository) {}

  async execute({
    title,
    category,
    authorId,
    kcal,
    timeToPrepare,
    portionsMin,
    portionsMax,
    page,
  }: Request) {
    if (!title) {
      throw new Error('Title is required');
    }

    if (!authorId) {
      throw new Error('AuthorId is required');
    }

    if (!category) {
      throw new Error('Category is required');
    }
    // const existingRecipe = await this.recipeRepository.findByTitle(title)

    // if (existingRecipe) {
    //   throw new ConflictError('Already exists a recipe with this title')
    // }
    

    const recipe = await this.recipeRepository.create({
      title,
      category,
      authorId,
      kcalMin,
      kcalMax,
      timeToPrepare,
      portionsMin,
      portionsMax,
      page, 
    })

    return { recipe }
  }
}
