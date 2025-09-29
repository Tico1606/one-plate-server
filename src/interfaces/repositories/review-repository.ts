import type { BaseReview, ReviewWithRelations } from '@/types/base/index.ts'

export interface ReviewRepository {
  findById(id: string): Promise<BaseReview | null>
  findByIdWithRelations(id: string): Promise<ReviewWithRelations | null>
  findByRecipe(
    recipeId: string,
    params: ListReviewsParams,
  ): Promise<{ reviews: ReviewWithRelations[]; total: number }>
  findByUser(
    userId: string,
    params: ListReviewsParams,
  ): Promise<{ reviews: ReviewWithRelations[]; total: number }>
  findOneByUserAndRecipe(userId: string, recipeId: string): Promise<BaseReview | null>
  create(data: CreateReviewData): Promise<BaseReview>
  update(id: string, data: UpdateReviewData): Promise<BaseReview>
  delete(id: string): Promise<void>
  getAverageRatingForRecipe(recipeId: string): Promise<number>
  countByRecipe(recipeId: string): Promise<number>
}

export interface CreateReviewData {
  recipeId: string
  userId: string
  rating: number
  comment?: string | null
}

export interface UpdateReviewData {
  rating?: number
  comment?: string | null
}

export interface ListReviewsParams {
  page: number
  limit: number
  sortBy?: 'newest' | 'oldest' | 'rating_high' | 'rating_low' | 'helpful'
}
