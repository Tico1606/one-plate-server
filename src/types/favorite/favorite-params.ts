export interface FavoriteCreateParams {
  userId: string
  recipeId: string
}

export interface FavoriteFilterParams {
  userId?: string
  recipeId?: string
}
