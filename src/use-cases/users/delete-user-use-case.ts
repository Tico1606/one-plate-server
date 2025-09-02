import { NotAllowedError, NotFoundError } from '@/errors/index.ts'
import type { UserRepository } from '@/interfaces/repositories/index.ts'

export interface DeleteUserRequest {
  userId: string
  requesterId: string
  requesterRole?: 'USER' | 'ADMIN'
}

export class DeleteUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: DeleteUserRequest): Promise<void> {
    const { userId, requesterId, requesterRole } = request

    // Apenas ADMIN pode deletar usuários
    if (requesterRole !== 'ADMIN') {
      throw new NotAllowedError('Apenas administradores podem deletar usuários')
    }

    // ADMIN não pode deletar a si mesmo
    if (requesterId === userId) {
      throw new NotAllowedError('Administradores não podem deletar a si mesmos')
    }

    const existingUser = await this.userRepository.findById(userId)

    if (!existingUser) {
      throw new NotFoundError('Usuário não encontrado')
    }

    await this.userRepository.delete(userId)
  }
}
