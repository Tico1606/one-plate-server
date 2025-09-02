import { NotAllowedError, NotFoundError } from '@/errors/index.ts'
import type { UserRepository } from '@/interfaces/repositories/index.ts'
import type { UpdateUserData } from '@/interfaces/repositories/user-repository.ts'
import type { BaseUser } from '@/types/base/index.ts'

export interface UpdateUserProfileRequest extends UpdateUserData {
  userId: string
  requesterId: string
  requesterRole?: 'USER' | 'ADMIN'
}

export interface UpdateUserProfileResponse {
  user: BaseUser
}

export class UpdateUserProfileUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(request: UpdateUserProfileRequest): Promise<UpdateUserProfileResponse> {
    const { userId, requesterId, requesterRole, ...updateData } = request

    const existingUser = await this.userRepository.findById(userId)

    if (!existingUser) {
      throw new NotFoundError('Usuário não encontrado')
    }

    // Verificar permissões: ADMIN pode editar qualquer usuário, USER só pode editar a si mesmo
    const isAdmin = requesterRole === 'ADMIN'
    const isOwner = requesterId === userId

    if (!isAdmin && !isOwner) {
      throw new NotAllowedError('Você só pode editar seu próprio perfil')
    }

    // ADMIN pode alterar role, USER não pode
    if (!isAdmin && 'role' in updateData) {
      throw new NotAllowedError('Apenas administradores podem alterar roles')
    }

    const updatedUser = await this.userRepository.update(userId, updateData)
    return { user: updatedUser }
  }
}
