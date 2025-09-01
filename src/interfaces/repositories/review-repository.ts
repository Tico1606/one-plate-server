import type {
  ReviewFilterParams,
  ReviewCreateParams,
  ReviewUpdateParams,
} from '@/types/review/index.ts'
import type {} from '../../types/index.ts'
import type { Review } from '@prisma/client'

export interface IReviewRepository {
  findById(id: string): Promise<Review | null>
  findMany(params: ReviewFilterParams): Promise<Review[]>
  getAverageRatingForRecipe(recipeId: string): Promise<number>
  create(data: ReviewCreateParams): Promise<Review>
  update(id: string, data: ReviewUpdateParams): Promise<Review>
  delete(id: string): Promise<void>
}
