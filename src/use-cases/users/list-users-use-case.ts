import type { UserRepository } from '@/interfaces/repositories/index.ts'
import type { ListUsersParams } from '@/interfaces/repositories/user-repository.ts'
import type { BaseUser } from '@/types/base/index.ts'

export interface ListUsersRequest extends ListUsersParams {}

export interface ListUsersResponse {
  users: BaseUser[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class ListUsersUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: ListUsersRequest): Promise<ListUsersResponse> {
    const result = await this.userRepository.list(request)

    return {
      ...result,
      page: request.page,
      limit: request.limit,
      totalPages: Math.ceil(result.total / request.limit),
    }
  }
}
