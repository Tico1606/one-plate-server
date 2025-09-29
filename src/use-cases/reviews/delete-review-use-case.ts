import type { ReviewRepository } from '@/interfaces/repositories/index.ts'

export interface DeleteReviewRequest {
  reviewId: string
  userId: string
}

export class DeleteReviewUseCase {
  constructor(private reviewRepository: ReviewRepository) {}

  async execute(request: DeleteReviewRequest): Promise<void> {
    // Verificar se a avaliação existe e pertence ao usuário
    const existingReview = await this.reviewRepository.findById(request.reviewId)

    if (!existingReview) {
      throw new Error('Avaliação não encontrada')
    }

    if (existingReview.userId !== request.userId) {
      throw new Error('Usuário não tem permissão para deletar esta avaliação')
    }

    await this.reviewRepository.delete(request.reviewId)
  }
}
