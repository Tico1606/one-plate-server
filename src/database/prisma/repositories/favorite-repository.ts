import type {
  CreateFavoriteData,
  FavoriteRepository,
  ListFavoritesParams,
} from '@/interfaces/repositories/favorite-repository.ts'
import type { BaseFavorite, FavoriteWithRelations } from '@/types/base/index.ts'
import { PrismaRepository } from './prisma-repository.ts'

export class PrismaFavoriteRepository
  extends PrismaRepository
  implements FavoriteRepository
{
  async findByUser(
    userId: string,
    params: ListFavoritesParams,
  ): Promise<{ favorites: FavoriteWithRelations[]; total: number }> {
    const { page, limit } = params
    const skip = (page - 1) * limit

    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          recipe: {
            include: {
              author: true,
              photos: {
                orderBy: { order: 'asc' },
              },
              steps: {
                orderBy: { order: 'asc' },
              },
              categories: {
                include: {
                  category: true,
                },
              },
              ingredients: {
                include: {
                  ingredient: true,
                },
              },
              reviews: {
                include: {
                  user: true,
                },
              },
              favorites: true,
              views: true,
              _count: {
                select: {
                  reviews: true,
                  favorites: true,
                  views: true,
                },
              },
            },
          },
          user: true,
        },
      }),
      this.prisma.favorite.count({ where: { userId } }),
    ])

    return { favorites: favorites as FavoriteWithRelations[], total }
  }

  async findByRecipe(
    recipeId: string,
    params: ListFavoritesParams,
  ): Promise<{ favorites: FavoriteWithRelations[]; total: number }> {
    const { page, limit } = params
    const skip = (page - 1) * limit

    const [favorites, total] = await Promise.all([
      this.prisma.favorite.findMany({
        where: { recipeId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          recipe: {
            include: {
              author: true,
              photos: {
                orderBy: { order: 'asc' },
              },
              steps: {
                orderBy: { order: 'asc' },
              },
              categories: {
                include: {
                  category: true,
                },
              },
              ingredients: {
                include: {
                  ingredient: true,
                },
              },
              reviews: {
                include: {
                  user: true,
                },
              },
              favorites: true,
              views: true,
              _count: {
                select: {
                  reviews: true,
                  favorites: true,
                  views: true,
                },
              },
            },
          },
          user: true,
        },
      }),
      this.prisma.favorite.count({ where: { recipeId } }),
    ])

    return { favorites: favorites as FavoriteWithRelations[], total }
  }

  async findOne(userId: string, recipeId: string): Promise<BaseFavorite | null> {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    })

    return favorite
  }

  async create(data: CreateFavoriteData): Promise<BaseFavorite> {
    const favorite = await this.prisma.favorite.create({
      data: {
        userId: data.userId,
        recipeId: data.recipeId,
      },
    })

    return favorite
  }

  async delete(userId: string, recipeId: string): Promise<void> {
    await this.prisma.favorite.delete({
      where: {
        userId_recipeId: {
          userId,
          recipeId,
        },
      },
    })
  }

  async countByRecipe(recipeId: string): Promise<number> {
    return this.prisma.favorite.count({
      where: { recipeId },
    })
  }

  async countByUser(userId: string): Promise<number> {
    return this.prisma.favorite.count({
      where: { userId },
    })
  }
}
