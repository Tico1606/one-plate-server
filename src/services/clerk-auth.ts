import { clerkClient, getAuth } from '@clerk/fastify'
import type { FastifyRequest } from 'fastify'
import { userRepository } from '@/database/repositories.ts'

export interface ClerkUser {
  id: string
  email: string
  role?: 'USER' | 'ADMIN'
}

/**
 * Obtém os dados do usuário autenticado via Clerk
 */
export async function getClerkUser(request: FastifyRequest): Promise<ClerkUser> {
  try {
    const { userId } = getAuth(request)

    if (!userId) {
      throw new Error('Usuário não autenticado')
    }

    // Buscar dados do usuário no Clerk
    const clerkUser = await clerkClient.users.getUser(userId)

    if (!clerkUser.emailAddresses[0]?.emailAddress) {
      throw new Error('Email não encontrado no usuário')
    }

    const email = clerkUser.emailAddresses[0].emailAddress

    // Buscar role do usuário no banco de dados
    const userFromDb = await userRepository.findById(userId)

    // Se usuário não existe no banco, criar com role USER
    if (!userFromDb) {
      await userRepository.create({
        id: userId,
        email,
        name:
          clerkUser.firstName && clerkUser.lastName
            ? `${clerkUser.firstName} ${clerkUser.lastName}`
            : clerkUser.firstName || null,
        photoUrl: clerkUser.imageUrl || null,
        role: 'USER',
      })
    }

    return {
      id: userId,
      email,
      role: userFromDb?.role || 'USER',
    }
  } catch {
    throw new Error('Erro: Falha na obtenção dos dados do usuário')
  }
}
