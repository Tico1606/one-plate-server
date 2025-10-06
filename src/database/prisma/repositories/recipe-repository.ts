import type {
  CreateRecipeData,
  ListRecipesParams,
  RecipeRepository,
  UpdateRecipeData,
} from '@/interfaces/repositories/recipe-repository.ts'
import type { BaseRecipe, RecipeWithRelations } from '@/types/base/index.ts'
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
        prepTime: data.prepTime,
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
            prepTime: data.prepTime,
            servings: data.servings,
            videoUrl: data.videoUrl,
            source: data.source,
            calories: data.calories,
            proteinGrams: data.proteinGrams,
            carbGrams: data.carbGrams,
            fatGrams: data.fatGrams,
            status: data.status,
            publishedAt: data.publishedAt,
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
        prepTime: data.prepTime,
        servings: data.servings,
        videoUrl: data.videoUrl,
        source: data.source,
        calories: data.calories,
        proteinGrams: data.proteinGrams,
        carbGrams: data.carbGrams,
        fatGrams: data.fatGrams,
        status: data.status,
        publishedAt: data.publishedAt,
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
    const {
      page,
      limit,
      search,
      category,
      categories,
      ingredient,
      difficulty,
      prepTime,
      servings,
      authorId,
      status,
      sortBy,
      sortOrder,
    } = params
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Filtrar por categoria única (compatibilidade)
    if (category) {
      where.categories = {
        some: {
          category: {
            name: { contains: category, mode: 'insensitive' },
          },
        },
      }
    }

    // Filtrar por múltiplas categorias (AND - todas devem estar presentes)
    if (categories && categories.length > 0) {
      where.AND = categories.map((categoryName) => ({
        categories: {
          some: {
            category: {
              name: { contains: categoryName, mode: 'insensitive' },
            },
          },
        },
      }))
    }

    if (ingredient) {
      where.ingredients = {
        some: {
          ingredient: {
            name: { contains: ingredient, mode: 'insensitive' },
          },
        },
      }
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    if (prepTime) {
      where.prepTime = prepTime
    }

    if (servings) {
      where.servings = servings
    }

    if (authorId) {
      where.authorId = authorId
    }

    if (status) {
      where.status = status
    }

    // Configurar ordenação
    const orderBy: any = {}
    if (sortBy) {
      if (sortBy === 'favorites') {
        orderBy.favorites = { _count: sortOrder || 'desc' }
      } else {
        orderBy[sortBy] = sortOrder || 'desc'
      }
    } else {
      orderBy.createdAt = 'desc' // Padrão
    }

    const [recipes, total] = await Promise.all([
      this.prisma.recipe.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.recipe.count({ where }),
    ])

    return { recipes, total }
  }

  async listWithRelations(
    params: ListRecipesParams,
    userId?: string,
  ): Promise<{ recipes: RecipeWithRelations[]; total: number }> {
    const {
      page,
      limit,
      search,
      category,
      categories,
      ingredient,
      difficulty,
      prepTime,
      servings,
      authorId,
      status,
      sortBy,
      sortOrder,
    } = params
    const skip = (page - 1) * limit

    console.log('🔍 [REPOSITORY DEBUG] Params recebidos:', {
      category,
      categories,
      search,
      ingredient,
    })

    const where: any = {}

    if (search) {
      // Normalizar o termo de busca removendo acentos
      const normalizedSearch = search
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()

      console.log('🔍 [REPOSITORY DEBUG] Search original:', search)
      console.log('🔍 [REPOSITORY DEBUG] Search normalizado:', normalizedSearch)

      // Usar raw query para aplicar unaccent nos campos do banco
      where.OR = [
        {
          title: {
            contains: search, // Usar search original para compatibilidade
            mode: 'insensitive',
          },
        },
        {
          ingredients: {
            some: {
              ingredient: {
                name: {
                  contains: search, // Usar search original para compatibilidade
                  mode: 'insensitive',
                },
              },
            },
          },
        },
      ]
    }

    // Filtrar por categoria única (compatibilidade)
    if (category) {
      console.log('🔍 [REPOSITORY DEBUG] Filtrando por categoria única:', category)
      // Se category parece ser um ID (cuid), filtrar por ID, senão por nome
      if (category.startsWith('cmg') || category.length > 20) {
        where.categories = {
          some: {
            categoryId: category,
          },
        }
      } else {
        where.categories = {
          some: {
            category: {
              name: { contains: category, mode: 'insensitive' },
            },
          },
        }
      }
    }

    // Filtrar por múltiplas categorias (AND - todas devem estar presentes)
    if (categories && categories.length > 0) {
      console.log('🔍 [REPOSITORY DEBUG] Filtrando por múltiplas categorias:', categories)
      where.AND = categories.map((categoryId) => ({
        categories: {
          some: {
            categoryId: categoryId,
          },
        },
      }))
    }

    console.log(
      '🔍 [REPOSITORY DEBUG] Where clause final:',
      JSON.stringify(where, null, 2),
    )

    if (ingredient) {
      where.ingredients = {
        some: {
          ingredient: {
            name: { contains: ingredient, mode: 'insensitive' },
          },
        },
      }
    }

    if (difficulty) {
      where.difficulty = difficulty
    }

    if (prepTime) {
      where.prepTime = prepTime
    }

    if (servings) {
      where.servings = servings
    }

    if (authorId) {
      where.authorId = authorId
    }

    if (status) {
      where.status = status
    }

    // Se há busca, usar raw query com unaccent
    let recipes: any, total: number
    if (search) {
      const normalizedSearch = search
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()

      console.log(
        '🔍 [REPOSITORY DEBUG] Usando raw query com unaccent para:',
        normalizedSearch,
      )

      // Habilitar extensão unaccent se não existir
      await this.prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS unaccent;`

      // Raw query com unaccent para remover acentos
      const rawQuery = `
        SELECT DISTINCT r.* FROM "Recipe" r
        LEFT JOIN "RecipeIngredient" ri ON r.id = ri."recipeId"
        LEFT JOIN "Ingredient" i ON ri."ingredientId" = i.id
        WHERE (
          unaccent(lower(r.title)) ILIKE unaccent(lower($1)) OR
          unaccent(lower(i.name)) ILIKE unaccent(lower($1))
        )
        ORDER BY r."createdAt" DESC
        LIMIT $2 OFFSET $3
      `

      const countQuery = `
        SELECT COUNT(DISTINCT r.id) as count FROM "Recipe" r
        LEFT JOIN "RecipeIngredient" ri ON r.id = ri."recipeId"
        LEFT JOIN "Ingredient" i ON ri."ingredientId" = i.id
        WHERE (
          unaccent(lower(r.title)) ILIKE unaccent(lower($1)) OR
          unaccent(lower(i.name)) ILIKE unaccent(lower($1))
        )
      `

      const [rawRecipes, rawCount] = await Promise.all([
        this.prisma.$queryRawUnsafe(rawQuery, `%${normalizedSearch}%`, limit, skip),
        this.prisma.$queryRawUnsafe(countQuery, `%${normalizedSearch}%`),
      ])

      const recipeIds = (rawRecipes as any[]).map((r) => r.id)

      // Buscar receitas completas com relacionamentos
      recipes = await this.prisma.recipe.findMany({
        where: { id: { in: recipeIds } },
        include: {
          author: true,
          photos: { orderBy: { order: 'asc' } },
          steps: { orderBy: { order: 'asc' } },
          categories: { include: { category: true } },
          ingredients: { include: { ingredient: true } },
          reviews: { include: { user: true } },
          favorites: userId ? { where: { userId } } : false,
          views: userId ? { where: { userId } } : false,
          _count: { select: { reviews: true, favorites: true, views: true } },
        },
        orderBy: { createdAt: 'desc' },
      })

      total = Number((rawCount as any[])[0].count)
    } else {
      // Configurar ordenação
      const orderBy: any = {}
      if (sortBy) {
        if (sortBy === 'favorites') {
          orderBy.favorites = { _count: sortOrder || 'desc' }
        } else if (sortBy === 'averageRating') {
          // Para averageRating, ordenar por createdAt como fallback
          // O rating será calculado depois e ordenado em memória
          orderBy.createdAt = sortOrder || 'desc'
        } else {
          orderBy[sortBy] = sortOrder || 'desc'
        }
      } else {
        orderBy.createdAt = 'desc' // Padrão
      }
      // Query normal sem busca
      ;[recipes, total] = await Promise.all([
        this.prisma.recipe.findMany({
          where,
          skip,
          take: limit,
          orderBy,
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
    }

    // Calcular rating médio para cada receita
    const recipesWithRating = await Promise.all(
      recipes.map(async (recipe: any) => {
        const averageRating = await this.prisma.review.aggregate({
          where: { recipeId: recipe.id },
          _avg: { rating: true },
        })

        return {
          ...recipe,
          averageRating: averageRating._avg.rating || 0,
        }
      }),
    )

    // Se a ordenação for por averageRating, ordenar em memória
    if (sortBy === 'averageRating') {
      recipesWithRating.sort((a, b) => {
        const aRating = a.averageRating || 0
        const bRating = b.averageRating || 0
        return sortOrder === 'asc' ? aRating - bRating : bRating - aRating
      })
    }

    return { recipes: recipesWithRating as RecipeWithRelations[], total }
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
          favorites: false,
          views: false,
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

    // Calcular rating médio para cada receita
    const recipesWithRating = await Promise.all(
      recipes.map(async (recipe) => {
        const averageRating = await this.prisma.review.aggregate({
          where: { recipeId: recipe.id },
          _avg: { rating: true },
        })

        return {
          ...recipe,
          averageRating: averageRating._avg.rating || 0,
        }
      }),
    )

    return { recipes: recipesWithRating as unknown as RecipeWithRelations[], total }
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
