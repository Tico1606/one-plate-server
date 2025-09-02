import type {
  CreateRecipeData,
  ListRecipesParams,
  RecipeRepository,
  UpdateRecipeData,
} from '@/interfaces/repositories/recipe-repository.ts'
import type { BaseRecipe, RecipeWithRelations } from '@/types/base/index.ts'
import type { PrismaClient } from '@prisma/client'
import { PrismaRepository } from './prisma-repository.ts'

export class PrismaRecipeRepository extends PrismaRepository implements RecipeRepository {
  async findById(id: string): Promise<BaseRecipe | null> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
    })

    return recipe
  }

  async findByIdWithRelations(
    id: string,
    userId?: string,
  ): Promise<RecipeWithRelations | null> {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
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
        favorites: userId
          ? {
              where: { userId },
            }
          : false,
        views: userId
          ? {
              where: { userId },
            }
          : false,
        _count: {
          select: {
            reviews: true,
            favorites: true,
            views: true,
          },
        },
      },
    })

    return recipe as RecipeWithRelations | null
  }

  async create(data: CreateRecipeData): Promise<BaseRecipe> {
    const recipe = await this.prisma.recipe.create({
      data: {
        title: data.title,
        description: data.description,
        authorId: data.authorId,
        difficulty: data.difficulty,
        prepMinutes: data.prepMinutes,
        cookMinutes: data.cookMinutes,
        servings: data.servings,
        videoUrl: data.videoUrl,
        source: data.source,
        calories: data.calories,
        proteinGrams: data.proteinGrams,
        carbGrams: data.carbGrams,
        fatGrams: data.fatGrams,
        status: data.status || 'DRAFT',
        photos: data.photos
          ? {
              create: data.photos.map((photo) => ({
                url: photo.url,
                order: photo.order,
              })),
            }
          : undefined,
        steps: {
          create: data.steps.map((step) => ({
            order: step.order,
            description: step.description,
            durationSec: step.durationSec,
          })),
        },
        ingredients: {
          create: data.ingredients.map((ingredient) => ({
            ingredientId: ingredient.ingredientId,
            amount: ingredient.amount,
            unit: ingredient.unit,
            note: ingredient.note,
            group: ingredient.group,
          })),
        },
        categories:
          data.categories.length > 0
            ? {
                create: data.categories.map((categoryId) => ({
                  categoryId,
                })),
              }
            : undefined,
      },
    })

    return recipe
  }

  async update(id: string, data: UpdateRecipeData): Promise<BaseRecipe> {
    // Se há dados de relacionamento, precisamos fazer transação
    if (data.photos || data.steps || data.ingredients || data.categories) {
      return await this.prisma.$transaction(async (tx) => {
        // Atualizar dados básicos
        const recipe = await tx.recipe.update({
          where: { id },
          data: {
            title: data.title,
            description: data.description,
            difficulty: data.difficulty,
            prepMinutes: data.prepMinutes,
            cookMinutes: data.cookMinutes,
            servings: data.servings,
            videoUrl: data.videoUrl,
            source: data.source,
            calories: data.calories,
            proteinGrams: data.proteinGrams,
            carbGrams: data.carbGrams,
            fatGrams: data.fatGrams,
            status: data.status,
          },
        })

        // Atualizar fotos se fornecidas
        if (data.photos) {
          await tx.recipePhoto.deleteMany({ where: { recipeId: id } })
          await tx.recipePhoto.createMany({
            data: data.photos.map((photo) => ({
              recipeId: id,
              url: photo.url,
              order: photo.order,
            })),
          })
        }

        // Atualizar passos se fornecidos
        if (data.steps) {
          await tx.step.deleteMany({ where: { recipeId: id } })
          await tx.step.createMany({
            data: data.steps.map((step) => ({
              recipeId: id,
              order: step.order,
              description: step.description,
              durationSec: step.durationSec,
            })),
          })
        }

        // Atualizar ingredientes se fornecidos
        if (data.ingredients) {
          await tx.recipeIngredient.deleteMany({ where: { recipeId: id } })
          await tx.recipeIngredient.createMany({
            data: data.ingredients.map((ingredient) => ({
              recipeId: id,
              ingredientId: ingredient.ingredientId,
              amount: ingredient.amount,
              unit: ingredient.unit,
              note: ingredient.note,
              group: ingredient.group,
            })),
          })
        }

        // Atualizar categorias se fornecidas
        if (data.categories) {
          await tx.recipeCategory.deleteMany({ where: { recipeId: id } })
          if (data.categories.length > 0) {
            await tx.recipeCategory.createMany({
              data: data.categories.map((categoryId) => ({
                recipeId: id,
                categoryId,
              })),
            })
          }
        }

        return recipe
      })
    }

    // Atualização simples sem relacionamentos
    const recipe = await this.prisma.recipe.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        difficulty: data.difficulty,
        prepMinutes: data.prepMinutes,
        cookMinutes: data.cookMinutes,
        servings: data.servings,
        videoUrl: data.videoUrl,
        source: data.source,
        calories: data.calories,
        proteinGrams: data.proteinGrams,
        carbGrams: data.carbGrams,
        fatGrams: data.fatGrams,
        status: data.status,
      },
    })

    return recipe
  }

  async delete(id: string): Promise<void> {
    await this.prisma.recipe.delete({
      where: { id },
    })
  }

  async list(
    params: ListRecipesParams,
  ): Promise<{ recipes: BaseRecipe[]; total: number }> {
    const { page, limit, search, category, difficulty, maxPrepTime, authorId, status } =
      params
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            name: { contains: category, mode: 'insensitive' },
          },
        },
      }
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    if (maxPrepTime) {
      where.prepMinutes = { lte: maxPrepTime }
    }

    if (authorId) {
      where.authorId = authorId
    }

    if (status) {
      where.status = status
    }

    const [recipes, total] = await Promise.all([
      this.prisma.recipe.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.recipe.count({ where }),
    ])

    return { recipes, total }
  }

  async listWithRelations(
    params: ListRecipesParams,
    userId?: string,
  ): Promise<{ recipes: RecipeWithRelations[]; total: number }> {
    const { page, limit, search, category, difficulty, maxPrepTime, authorId, status } =
      params
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (category) {
      where.categories = {
        some: {
          category: {
            name: { contains: category, mode: 'insensitive' },
          },
        },
      }
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    if (maxPrepTime) {
      where.prepMinutes = { lte: maxPrepTime }
    }

    if (authorId) {
      where.authorId = authorId
    }

    if (status) {
      where.status = status
    }

    const [recipes, total] = await Promise.all([
      this.prisma.recipe.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
          favorites: userId
            ? {
                where: { userId },
              }
            : false,
          views: userId
            ? {
                where: { userId },
              }
            : false,
          _count: {
            select: {
              reviews: true,
              favorites: true,
              views: true,
            },
          },
        },
      }),
      this.prisma.recipe.count({ where }),
    ])

    return { recipes: recipes as RecipeWithRelations[], total }
  }

  async findByAuthor(
    authorId: string,
    params: ListRecipesParams,
  ): Promise<{ recipes: BaseRecipe[]; total: number }> {
    return this.list({ ...params, authorId })
  }

  async findFeatured(
    params: ListRecipesParams,
  ): Promise<{ recipes: RecipeWithRelations[]; total: number }> {
    // Por enquanto, retorna receitas com mais favoritos
    // TODO: Implementar lógica de receitas em destaque
    const { page, limit } = params
    const skip = (page - 1) * limit

    const [recipes, total] = await Promise.all([
      this.prisma.recipe.findMany({
        where: {
          status: 'PUBLISHED',
        },
        skip,
        take: limit,
        orderBy: [{ favorites: { _count: 'desc' } }, { createdAt: 'desc' }],
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
          _count: {
            select: {
              reviews: true,
              favorites: true,
              views: true,
            },
          },
        },
      }),
      this.prisma.recipe.count({
        where: {
          status: 'PUBLISHED',
        },
      }),
    ])

    return { recipes: recipes as RecipeWithRelations[], total }
  }

  async incrementView(recipeId: string, userId?: string): Promise<void> {
    await this.prisma.recipeView.create({
      data: {
        recipeId,
        userId: userId || null,
      },
    })
  }
}
