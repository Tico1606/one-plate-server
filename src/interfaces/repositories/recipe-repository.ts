import type {
  RecipeCreateParams,
  RecipeFilterParams,
  RecipeUpdateParams,
} from '@/types/index.ts'
import type { Recipe } from '@prisma/client'

export interface IRecipeRepository {
  findById(recipeId: string): Promise<Recipe | null>
  findByTitle(title: string): Promise<Recipe | null>
  findMany(params: RecipeFilterParams): Promise<Recipe[]>
  create(data: RecipeCreateParams): Promise<Recipe>
  update(data: RecipeUpdateParams, recipeId: string): Promise<Recipe>
  delete(recipeId: string): Promise<void>
}
