import type {
  RecipeCreateParams,
  RecipeFilterParams,
  RecipeUpdateParams,
} from '@/types/index.ts'
import type { Recipe } from '@prisma/client'

export interface IRecipeRepository {
  findById(id: string): Promise<Recipe | null>
  findMany(params: RecipeFilterParams): Promise<Recipe[]>
  findByAuthorId(authorId: string): Promise<Recipe[]>
  create(data: RecipeCreateParams): Promise<Recipe>
  update(id: string, data: RecipeUpdateParams): Promise<Recipe>
  delete(id: string): Promise<void>
}
