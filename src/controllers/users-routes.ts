import { userRepository } from '@/database/repositories.ts'
import { authMiddleware } from '@/middleware/auth.ts'
import { adminOnlyMiddleware, adminOrOwnerMiddleware } from '@/middleware/role.ts'
import {
  DeleteUserUseCase,
  GetUserByIdUseCase,
  ListUsersUseCase,
  UpdateUserProfileUseCase,
} from '@/use-cases/users/index.ts'
import type { FastifyInstance } from 'fastify'
import { z } from 'zod'

// Schemas de validação
const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  photoUrl: z.string().url().optional(),
  role: z.enum(['USER', 'ADMIN']).optional(),
})

const listUsersSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
})

export async function usersRoutes(fastify: FastifyInstance) {
  // Listar usuários (apenas ADMIN)
  fastify.get(
    '/users',
    {
      schema: {
        querystring: listUsersSchema,
      },
      preHandler: [authMiddleware, adminOnlyMiddleware],
    },
    async (request, reply) => {
      const useCase = new ListUsersUseCase(userRepository)
      const result = await useCase.execute(request.query as any)

      return reply.send(result)
    },
  )

  // Buscar usuário por ID (ADMIN ou próprio usuário)
  fastify.get(
    '/users/:id',
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
      },
      preHandler: [authMiddleware, adminOrOwnerMiddleware],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const useCase = new GetUserByIdUseCase(userRepository)
      const result = await useCase.execute({ userId: id })

      return reply.send(result)
    },
  )

  // Atualizar perfil do usuário (autenticado, apenas próprio perfil)
  fastify.put(
    '/users/me',
    {
      schema: {
        body: updateUserSchema,
      },
      preHandler: [authMiddleware],
    },
    async (request, reply) => {
      const useCase = new UpdateUserProfileUseCase(userRepository)
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const result = await useCase.execute({
        userId: request.user.id,
        requesterId: request.user.id,
        requesterRole: request.user.role,
        ...(request.body as any),
      })

      return reply.send(result)
    },
  )

  // Buscar perfil do usuário logado (autenticado)
  fastify.get(
    '/users/me',
    {
      preHandler: [authMiddleware],
    },
    async (request, reply) => {
      const useCase = new GetUserByIdUseCase(userRepository)
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const result = await useCase.execute({ userId: request.user.id })

      return reply.send(result)
    },
  )

  // Deletar usuário (apenas ADMIN)
  fastify.delete(
    '/users/:id',
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
      },
      preHandler: [authMiddleware, adminOnlyMiddleware],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const useCase = new DeleteUserUseCase(userRepository)
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      await useCase.execute({
        userId: id,
        requesterId: request.user.id,
        requesterRole: request.user.role,
      })

      return reply.status(204).send()
    },
  )
}
