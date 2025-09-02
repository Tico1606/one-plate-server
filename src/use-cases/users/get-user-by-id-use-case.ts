import { NotFoundError } from '@/errors/index.ts'
import type { UserRepository } from '@/interfaces/repositories/index.ts'
import type { BaseUser } from '@/types/base/index.ts'

export interface GetUserByIdRequest {
  userId: string
}

export interface GetUserByIdResponse {
  user: BaseUser
}

export class GetUserByIdUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: GetUserByIdRequest): Promise<GetUserByIdResponse> {
    const { userId } = request

    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new NotFoundError('Usuário não encontrado')
    }

    return { user }
  }
}
