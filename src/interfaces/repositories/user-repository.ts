import type { BaseUser, UserWithRelations } from '@/types/base/index.ts'

export interface UserRepository {
  findById(id: string): Promise<BaseUser | null>
  findByEmail(email: string): Promise<BaseUser | null>
  findByIdWithRelations(id: string): Promise<UserWithRelations | null>
  create(data: CreateUserData): Promise<BaseUser>
  update(id: string, data: UpdateUserData): Promise<BaseUser>
  delete(id: string): Promise<void>
  list(params: ListUsersParams): Promise<{ users: BaseUser[]; total: number }>
  listWithRelations(
    params: ListUsersParams,
  ): Promise<{ users: UserWithRelations[]; total: number }>
}

export interface CreateUserData {
  id: string
  email: string
  name?: string | null
  photoUrl?: string | null
  role?: 'USER' | 'ADMIN'
}

export interface UpdateUserData {
  name?: string | null
  photoUrl?: string | null
  role?: 'USER' | 'ADMIN'
}

export interface ListUsersParams {
  page: number
  limit: number
  search?: string
}
