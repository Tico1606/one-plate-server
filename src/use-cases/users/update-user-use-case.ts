import { NotFoundError } from '@/errors/index.ts'
import type { IUserRepository } from '@/interfaces/index.ts'

type Request = {
  userId: string
  name?: string
  bio?: string
}

export class UpdateUserProfileUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute({ userId, name, bio }: Request) {
    const existingUser = await this.userRepository.findById(userId)

    if (!existingUser) {
      throw new NotFoundError("User doesn't exist")
    }

    const updatedUser = await this.userRepository.update({ name, bio }, userId)
    return { user: updatedUser }
  }
}
