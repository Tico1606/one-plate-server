export interface ReviewCreateParams {
  userId: string
  recipeId: string
  rating: number // 1-5
  comment?: string
}

export interface ReviewUpdateParams {
  rating?: number
  comment?: string
}

export interface ReviewFilterParams {
  userId?: string
  recipeId?: string
}
