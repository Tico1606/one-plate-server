import type {
  CreateRecipeData,
  ListRecipesParams,
  UpdateRecipeData,
} from '@/interfaces/repositories/recipe-repository.ts'

export interface RecipeCreateParams extends CreateRecipeData {}
export interface RecipeUpdateParams extends UpdateRecipeData {}
export interface RecipeFilterParams extends ListRecipesParams {}
