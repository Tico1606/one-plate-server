import type { IUserRepository } from '@/interfaces/index.ts'
import { NotFoundError } from '@/errors/index.ts'

type Request = {
  userId: string
}

export class GetUserByIdUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute({ userId }: Request) {
    const user = await this.userRepository.findById(userId)

    if (!user) {
      throw new NotFoundError("User doesn't exist")
    }

    return { user }
  }
}
