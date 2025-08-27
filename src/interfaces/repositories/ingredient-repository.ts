import type {
  IngredientCreateParams,
  IngredientFilterParams,
  IngredientUpdateParams,
} from '@/types/index.ts'
import type { Ingredient } from '@prisma/client'

export interface IIngredientRepository {
  findById(ingredientId: string): Promise<Ingredient | null>
  findMany(params: IngredientFilterParams): Promise<Ingredient[]>
  create(data: IngredientCreateParams): Promise<Ingredient>
  update(data: IngredientUpdateParams, ingredientId: string): Promise<Ingredient>
  delete(ingredientId: string): Promise<void>
}
