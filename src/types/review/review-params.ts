import type {
  CreateReviewData,
  ListReviewsParams,
  UpdateReviewData,
} from '@/interfaces/repositories/review-repository.ts'

export interface ReviewCreateParams extends CreateReviewData {}
export interface ReviewUpdateParams extends UpdateReviewData {}
export interface ReviewFilterParams extends ListReviewsParams {}
