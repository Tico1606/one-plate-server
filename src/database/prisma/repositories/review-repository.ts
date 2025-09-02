import type {
  CreateReviewData,
  ListReviewsParams,
  ReviewRepository,
  UpdateReviewData,
} from '@/interfaces/repositories/review-repository.ts'
import type { BaseReview, ReviewWithRelations } from '@/types/base/index.ts'
import type { PrismaClient } from '@prisma/client'
import { PrismaRepository } from './prisma-repository.ts'

export class PrismaReviewRepository extends PrismaRepository implements ReviewRepository {
  async findById(id: string): Promise<BaseReview | null> {
    const review = await this.prisma.review.findUnique({
      where: { id },
    })

    return review
  }

  async findByIdWithRelations(id: string): Promise<ReviewWithRelations | null> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        recipe: true,
        user: true,
      },
    })

    return review as ReviewWithRelations | null
  }

  async findByRecipe(
    recipeId: string,
    params: ListReviewsParams,
  ): Promise<{ reviews: ReviewWithRelations[]; total: number }> {
    const { page, limit, sortBy } = params
    const skip = (page - 1) * limit

    const orderBy = this.getOrderBy(sortBy)

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { recipeId },
        skip,
        take: limit,
        orderBy,
        include: {
          recipe: true,
          user: true,
        },
      }),
      this.prisma.review.count({ where: { recipeId } }),
    ])

    return { reviews: reviews as ReviewWithRelations[], total }
  }

  async findByUser(
    userId: string,
    params: ListReviewsParams,
  ): Promise<{ reviews: ReviewWithRelations[]; total: number }> {
    const { page, limit, sortBy } = params
    const skip = (page - 1) * limit

    const orderBy = this.getOrderBy(sortBy)

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy,
        include: {
          recipe: true,
          user: true,
        },
      }),
      this.prisma.review.count({ where: { userId } }),
    ])

    return { reviews: reviews as ReviewWithRelations[], total }
  }

  async findOneByUserAndRecipe(
    userId: string,
    recipeId: string,
  ): Promise<BaseReview | null> {
    const review = await this.prisma.review.findUnique({
      where: {
        recipeId_userId: {
          recipeId,
          userId,
        },
      },
    })

    return review
  }

  async create(data: CreateReviewData): Promise<BaseReview> {
    const review = await this.prisma.review.create({
      data: {
        recipeId: data.recipeId,
        userId: data.userId,
        rating: data.rating,
        comment: data.comment,
      },
    })

    return review
  }

  async update(id: string, data: UpdateReviewData): Promise<BaseReview> {
    const review = await this.prisma.review.update({
      where: { id },
      data: {
        rating: data.rating,
        comment: data.comment,
      },
    })

    return review
  }

  async delete(id: string): Promise<void> {
    await this.prisma.review.delete({
      where: { id },
    })
  }

  async getAverageRatingForRecipe(recipeId: string): Promise<number> {
    const result = await this.prisma.review.aggregate({
      where: { recipeId },
      _avg: {
        rating: true,
      },
    })

    return result._avg.rating || 0
  }

  async countByRecipe(recipeId: string): Promise<number> {
    return this.prisma.review.count({
      where: { recipeId },
    })
  }

  async incrementHelpfulCount(id: string): Promise<void> {
    await this.prisma.review.update({
      where: { id },
      data: {
        helpfulCount: {
          increment: 1,
        },
      },
    })
  }

  private getOrderBy(sortBy?: string) {
    switch (sortBy) {
      case 'newest':
        return { createdAt: 'desc' as const }
      case 'oldest':
        return { createdAt: 'asc' as const }
      case 'rating_high':
        return { rating: 'desc' as const }
      case 'rating_low':
        return { rating: 'asc' as const }
      case 'helpful':
        return { helpfulCount: 'desc' as const }
      default:
        return { createdAt: 'desc' as const }
    }
  }
}
