import type { FastifyReply, FastifyRequest } from 'fastify'
import { NotAllowedError } from '@/errors/index.ts'

/**
 * Middleware que verifica se o usuário tem role de ADMIN
 */
export async function adminOnlyMiddleware(request: FastifyRequest, reply: FastifyReply) {
  if (!request.user) {
    throw new NotAllowedError('Usuário não autenticado')
  }

  if (request.user.role !== 'ADMIN') {
    throw new NotAllowedError(
      'Acesso negado. Apenas administradores podem realizar esta ação',
    )
  }
}

/**
 * Middleware que verifica se o usuário é ADMIN ou o próprio usuário
 */
export async function adminOrOwnerMiddleware(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  if (!request.user) {
    throw new NotAllowedError('Usuário não autenticado')
  }

  const targetUserId = (request.params as any)?.id || (request.params as any)?.userId

  const isAdmin = request.user.role === 'ADMIN'
  const isOwner = request.user.id === targetUserId

  if (!isAdmin && !isOwner) {
    throw new NotAllowedError('Acesso negado. Você só pode acessar seus próprios dados')
  }
}
