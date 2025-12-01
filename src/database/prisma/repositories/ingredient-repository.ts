import type { PrismaClient } from '@prisma/client'
import type {
  CreateIngredientData,
  IngredientRepository,
  ListIngredientsParams,
  UpdateIngredientData,
} from '@/interfaces/repositories/ingredient-repository.ts'
import type { BaseIngredient } from '@/types/base/index.ts'
import { PrismaRepository } from './prisma-repository.ts'

export class PrismaIngredientRepository
  extends PrismaRepository
  implements IngredientRepository
{
  constructor(prisma: PrismaClient) {
    super(prisma)
  }

  async findById(id: string): Promise<BaseIngredient | null> {
    const ingredient = await this.prisma.ingredient.findUnique({
      where: { id },
    })

    return ingredient
  }

  async findByName(name: string): Promise<BaseIngredient | null> {
    const ingredient = await this.prisma.ingredient.findFirst({
      where: { name },
    })

    return ingredient
  }

  async list(
    params: ListIngredientsParams,
  ): Promise<{ ingredients: BaseIngredient[]; total: number }> {
    const { page = 1, limit = 20, search, sortBy = 'name', sortOrder = 'asc' } = params

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      }
    }

    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    const [ingredients, total] = await Promise.all([
      this.prisma.ingredient.findMany({
        where,
        skip,
        take: limit,
        orderBy,
      }),
      this.prisma.ingredient.count({ where }),
    ])

    return { ingredients, total }
  }

  async create(data: CreateIngredientData): Promise<BaseIngredient> {
    const ingredient = await this.prisma.ingredient.create({
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
      },
    })

    return ingredient
  }

  async update(id: string, data: UpdateIngredientData): Promise<BaseIngredient> {
    const ingredient = await this.prisma.ingredient.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
      },
    })

    return ingredient
  }

  async delete(id: string): Promise<void> {
    await this.prisma.ingredient.delete({
      where: { id },
    })
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.ingredient.count({
      where: { id },
    })

    return count > 0
  }
}
