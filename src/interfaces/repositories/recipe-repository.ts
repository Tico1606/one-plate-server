import type { Recipe } from '@prisma/client'
import type {
  RecipeCreateParams,
  RecipeFilterParams,
  RecipeUpdateParams,
} from '../../types/recipe/index.ts'

export interface IRecipeRepository {
  findById(id: string): Promise<Recipe | null>
  findMany(params: RecipeFilterParams): Promise<Recipe[]>
  create(data: RecipeCreateParams): Promise<Recipe>
  update(id: string, data: RecipeUpdateParams): Promise<Recipe>
  delete(id: string): Promise<void>
}
