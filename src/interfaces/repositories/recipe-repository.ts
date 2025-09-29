import type { BaseRecipe, RecipeWithRelations } from '@/types/base/index.ts'

export interface RecipeRepository {
  findById(id: string): Promise<BaseRecipe | null>
  findByIdWithRelations(id: string, userId?: string): Promise<RecipeWithRelations | null>
  create(data: CreateRecipeData): Promise<BaseRecipe>
  update(id: string, data: UpdateRecipeData): Promise<BaseRecipe>
  delete(id: string): Promise<void>
  list(params: ListRecipesParams): Promise<{ recipes: BaseRecipe[]; total: number }>
  listWithRelations(
    params: ListRecipesParams,
    userId?: string,
  ): Promise<{ recipes: RecipeWithRelations[]; total: number }>
  findByAuthor(
    authorId: string,
    params: ListRecipesParams,
  ): Promise<{ recipes: BaseRecipe[]; total: number }>
  findFeatured(
    params: ListRecipesParams,
  ): Promise<{ recipes: RecipeWithRelations[]; total: number }>
  incrementView(recipeId: string, userId?: string): Promise<void>
}

export interface CreateRecipeData {
  title: string
  description?: string | null
  authorId: string
  difficulty: 'EASY' | 'MEDIUM' | 'HARD'
  prepTime: number
  servings: number
  videoUrl?: string | null
  source?: string | null
  calories?: number | null
  proteinGrams?: number | null
  carbGrams?: number | null
  fatGrams?: number | null
  status?: 'DRAFT' | 'PUBLISHED'
  photos?: Array<{
    url: string
    order: number
  }>
  steps: Array<{
    order: number
    description: string
    durationSec?: number | null
  }>
  ingredients: Array<{
    ingredientId: string
    amount?: number | null
    unit?: string | null
    note?: string | null
    group?: string | null
  }>
  categories: string[]
}

export interface UpdateRecipeData {
  title?: string
  description?: string | null
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  prepTime?: number
  servings?: number
  videoUrl?: string | null
  source?: string | null
  calories?: number | null
  proteinGrams?: number | null
  carbGrams?: number | null
  fatGrams?: number | null
  status?: 'DRAFT' | 'PUBLISHED'
  photos?: Array<{
    url: string
    order: number
  }>
  steps?: Array<{
    order: number
    description: string
    durationSec?: number | null
  }>
  ingredients?: Array<{
    ingredientId: string
    amount?: number | null
    unit?: string | null
    note?: string | null
    group?: string | null
  }>
  categories?: string[]
}

export interface ListRecipesParams {
  page: number
  limit: number
  search?: string
  category?: string
  ingredient?: string
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD'
  prepTime?: number
  servings?: number
  featured?: boolean
  authorId?: string
  status?: 'DRAFT' | 'PUBLISHED'
  sortBy?:
    | 'createdAt'
    | 'title'
    | 'prepTime'
    | 'calories'
    | 'favorites'
    | 'averageRating'
    | 'servings'
    | 'difficulty'
  sortOrder?: 'asc' | 'desc'
}
