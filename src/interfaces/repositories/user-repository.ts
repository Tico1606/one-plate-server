import type { UserCreateParams, UserUpdateParams } from '@/types/users/user-params.ts'
import type { UserFilterParams } from '../../types/index.ts'
import type { User } from '@prisma/client'

export interface IUserRepository {
  findById(id: string): Promise<User | null>
  findByEmail(email: string): Promise<User | null>
  findMany(params: UserFilterParams): Promise<User[]>
  create(data: UserCreateParams): Promise<User>
  update(id: string, data: UserUpdateParams): Promise<User>
  delete(id: string): Promise<void>
}
