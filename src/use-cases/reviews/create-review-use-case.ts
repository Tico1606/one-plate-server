import type { ReviewRepository } from '@/interfaces/repositories/index.ts'
import type { CreateReviewData } from '@/interfaces/repositories/review-repository.ts'
import type { BaseReview } from '@/types/base/index.ts'

export interface CreateReviewRequest extends CreateReviewData {
  userId: string
}

export interface CreateReviewResponse extends BaseReview {}

export class CreateReviewUseCase {
  constructor(private reviewRepository: ReviewRepository) {}

  async execute(request: CreateReviewRequest): Promise<CreateReviewResponse> {
    // Verificar se o usuário já avaliou esta receita
    const existingReview = await this.reviewRepository.findOneByUserAndRecipe(
      request.userId,
      request.recipeId,
    )

    if (existingReview) {
      throw new Error('Usuário já avaliou esta receita')
    }

    const review = await this.reviewRepository.create({
      recipeId: request.recipeId,
      userId: request.userId,
      rating: request.rating,
      comment: request.comment,
    })

    return review
  }
}
