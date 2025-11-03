import { v4 as uuidv4 } from 'uuid'
import { ConflictError } from '@/errors/conflict-error.ts'
import { ValidationError } from '@/errors/validation-error.ts'
import type { UserRepository } from '@/interfaces/repositories/user-repository.ts'
import type { BaseUser } from '@/types/base/index.ts'

export interface CreateUserParams {
  email: string
  name?: string
  description?: string
  photoUrl?: string
  role?: 'USER' | 'ADMIN'
}

export class CreateUserUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(params: CreateUserParams): Promise<BaseUser> {
    const { email, name, description, photoUrl, role = 'USER' } = params

    // Validar email
    if (!email || !email.includes('@')) {
      throw new ValidationError('Email é obrigatório e deve ser válido')
    }

    // Verificar se usuário já existe
    const existingUser = await this.userRepository.findByEmail(email)
    if (existingUser) {
      throw new ConflictError('Usuário com este email já existe')
    }

    // Gerar ID único para o usuário
    const userId = uuidv4()

    // Criar usuário
    const user = await this.userRepository.create({
      id: userId,
      email,
      name: name || 'Usuário',
      description,
      photoUrl,
      role,
    })

    return user
  }
}
