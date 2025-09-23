import type {
  BaseCategory,
  CategoryWithRelations,
  CreateCategoryData,
  ListCategoriesParams,
  UpdateCategoryData,
} from '@/interfaces/repositories/category-repository.ts'
import { PrismaRepository } from './prisma-repository.ts'

export class PrismaCategoryRepository extends PrismaRepository {
  async findById(id: string): Promise<BaseCategory | null> {
    const category = await this.prisma.category.findUnique({
      where: { id },
    })

    return category
  }

  async findByName(name: string): Promise<BaseCategory | null> {
    const category = await this.prisma.category.findUnique({
      where: { name },
    })

    return category
  }

  async create(data: CreateCategoryData): Promise<BaseCategory> {
    const category = await this.prisma.category.create({
      data: {
        name: data.name,
      },
    })

    return category
  }

  async update(id: string, data: UpdateCategoryData): Promise<BaseCategory> {
    const category = await this.prisma.category.update({
      where: { id },
      data: {
        name: data.name,
      },
    })

    return category
  }

  async delete(id: string): Promise<void> {
    await this.prisma.category.delete({
      where: { id },
    })
  }

  async list(
    params: ListCategoriesParams,
  ): Promise<{ categories: BaseCategory[]; total: number }> {
    const { page, limit, search } = params
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      }
    }

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      this.prisma.category.count({ where }),
    ])

    return { categories, total }
  }

  async listWithRelations(
    params: ListCategoriesParams,
  ): Promise<{ categories: CategoryWithRelations[]; total: number }> {
    const { page, limit, search } = params
    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.name = {
        contains: search,
        mode: 'insensitive',
      }
    }

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              recipes: true,
            },
          },
        },
      }),
      this.prisma.category.count({ where }),
    ])

    return { categories: categories as CategoryWithRelations[], total }
  }
}
