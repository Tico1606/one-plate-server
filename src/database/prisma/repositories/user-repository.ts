import type {
  CreateUserData,
  ListUsersParams,
  UpdateUserData,
  UserRepository,
} from '@/interfaces/repositories/user-repository.ts'
import type { BaseUser, UserWithRelations } from '@/types/base/index.ts'
import { PrismaRepository } from './prisma-repository.ts'

export class PrismaUserRepository extends PrismaRepository implements UserRepository {
  async findById(id: string): Promise<BaseUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    })

    return user
  }

  async findByEmail(email: string): Promise<BaseUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    })

    return user
  }

  async findByIdWithRelations(id: string): Promise<UserWithRelations | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        recipes: true,
        reviews: true,
        favorites: {
          include: {
            recipe: true,
          },
        },
        shoppingLists: true,
        recipeViews: true,
      },
    })

    return user as UserWithRelations | null
  }

  async create(data: CreateUserData): Promise<BaseUser> {
    const user = await this.prisma.user.create({
      data: {
        id: data.id,
        email: data.email,
        name: data.name,
        photoUrl: data.photoUrl,
        role: data.role || 'USER',
      },
    })

    return user
  }

  async update(id: string, data: UpdateUserData): Promise<BaseUser> {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        name: data.name,
        photoUrl: data.photoUrl,
        role: data.role,
      },
    })

    return user
  }

  async delete(id: string): Promise<void> {
    await this.prisma.user.delete({
      where: { id },
    })
  }

  async list(params: ListUsersParams): Promise<{ users: BaseUser[]; total: number }> {
    const { page, limit, search } = params
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ])

    return { users, total }
  }

  async listWithRelations(
    params: ListUsersParams,
  ): Promise<{ users: UserWithRelations[]; total: number }> {
    const { page, limit, search } = params
    const skip = (page - 1) * limit

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { email: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          recipes: true,
          reviews: true,
          favorites: {
            include: {
              recipe: true,
            },
          },
          shoppingLists: true,
          recipeViews: true,
        },
      }),
      this.prisma.user.count({ where }),
    ])

    return { users: users as UserWithRelations[], total }
  }
}
