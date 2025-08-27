import type { UserFilterParams, UserUpdateParams } from '@/types/index.ts'
import type { User } from '@prisma/client'

export interface IUserRepository {
  findById(userId: string): Promise<User | null>
  findMany(params: UserFilterParams): Promise<User[]>
  update(data: UserUpdateParams, userId: string): Promise<User>
}
