import type { IUserRepository } from '@/interfaces/index.ts'

type Request = {
  id?: string | undefined
  email?: string | undefined
}

export class ListUsersUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute({ id, email }: Request) {
    const users = await this.userRepository.findMany({ id, email })

    return { users }
  }
}
