import type { ReviewRepository } from '@/interfaces/repositories/index.ts'
import type { UpdateReviewData } from '@/interfaces/repositories/review-repository.ts'
import type { BaseReview } from '@/types/base/index.ts'

export interface UpdateReviewRequest extends UpdateReviewData {
  reviewId: string
  userId: string
}

export interface UpdateReviewResponse extends BaseReview {}

export class UpdateReviewUseCase {
  constructor(private reviewRepository: ReviewRepository) {}

  async execute(request: UpdateReviewRequest): Promise<UpdateReviewResponse> {
    // Verificar se a avaliação existe e pertence ao usuário
    const existingReview = await this.reviewRepository.findById(request.reviewId)

    if (!existingReview) {
      throw new Error('Avaliação não encontrada')
    }

    if (existingReview.userId !== request.userId) {
      throw new Error('Usuário não tem permissão para editar esta avaliação')
    }

    const updatedReview = await this.reviewRepository.update(request.reviewId, {
      rating: request.rating,
      comment: request.comment,
    })

    return updatedReview
  }
}
