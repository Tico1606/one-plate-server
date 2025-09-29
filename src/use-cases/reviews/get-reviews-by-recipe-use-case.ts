import type { ReviewRepository } from '@/interfaces/repositories/index.ts'
import type { ListReviewsParams } from '@/interfaces/repositories/review-repository.ts'
import type { ReviewWithRelations } from '@/types/base/index.ts'

export interface GetReviewsByRecipeRequest extends ListReviewsParams {
  recipeId: string
}

export interface GetReviewsByRecipeResponse {
  reviews: ReviewWithRelations[]
  total: number
  page: number
  limit: number
  totalPages: number
  averageRating: number
  totalRatings: number
}

export class GetReviewsByRecipeUseCase {
  constructor(private reviewRepository: ReviewRepository) {}

  async execute(request: GetReviewsByRecipeRequest): Promise<GetReviewsByRecipeResponse> {
    const { recipeId, ...params } = request

    const result = await this.reviewRepository.findByRecipe(recipeId, params)

    // Calcular rating médio
    const averageRating = await this.reviewRepository.getAverageRatingForRecipe(recipeId)
    const totalRatings = await this.reviewRepository.countByRecipe(recipeId)

    return {
      ...result,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(result.total / params.limit),
      averageRating: Math.round(averageRating * 10) / 10, // Arredondar para 1 casa decimal
      totalRatings,
    }
  }
}
