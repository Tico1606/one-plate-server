import type { BaseFavorite, FavoriteWithRelations } from '@/types/base/index.ts'

export interface FavoriteRepository {
  findByUser(
    userId: string,
    params: ListFavoritesParams,
  ): Promise<{ favorites: FavoriteWithRelations[]; total: number }>
  findByRecipe(
    recipeId: string,
    params: ListFavoritesParams,
  ): Promise<{ favorites: FavoriteWithRelations[]; total: number }>
  findOne(userId: string, recipeId: string): Promise<BaseFavorite | null>
  create(data: CreateFavoriteData): Promise<BaseFavorite>
  delete(userId: string, recipeId: string): Promise<void>
  countByRecipe(recipeId: string): Promise<number>
  countByUser(userId: string): Promise<number>
}

export interface CreateFavoriteData {
  userId: string
  recipeId: string
}

export interface ListFavoritesParams {
  page: number
  limit: number
}
