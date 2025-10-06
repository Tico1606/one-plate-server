import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { favoriteRepository } from '@/database/repositories.ts'
import { getAuthMiddleware, getOptionalAuthMiddleware } from '@/middleware/dev-auth.ts'
import {
  CreateFavoriteUseCase,
  DeleteFavoriteUseCase,
  ListFavoritesUseCase,
} from '@/use-cases/favorites/index.ts'

// Schemas de validação
const createFavoriteSchema = z.object({
  recipeId: z.string().min(1, 'ID da receita é obrigatório'),
})

const listFavoritesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  userId: z.string().optional(),
  recipeId: z.string().optional(),
})

export async function favoritesRoutes(fastify: FastifyInstance) {
  // Adicionar receita aos favoritos (autenticado)
  fastify.post(
    '/favorites',
    {
      schema: {
        body: createFavoriteSchema,
      },
      preHandler: [getAuthMiddleware()],
    },
    async (request, reply) => {
      const useCase = new CreateFavoriteUseCase(favoriteRepository)

      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const result = await useCase.execute({
        userId: request.user.id,
        recipeId: (request.body as any).recipeId,
      })

      return reply.status(201).send(result)
    },
  )

  // Listar favoritos (público, com filtros opcionais)
  fastify.get(
    '/favorites',
    {
      schema: {
        querystring: listFavoritesSchema,
      },
      preHandler: [getOptionalAuthMiddleware()],
    },
    async (request, reply) => {
      const useCase = new ListFavoritesUseCase(favoriteRepository)
      const query = request.query as any

      // Se não foi fornecido userId nem recipeId, usar o ID do usuário autenticado
      const params = {
        page: query.page,
        limit: query.limit,
        userId: query.userId || request.user?.id,
        recipeId: query.recipeId,
      }

      const result = await useCase.execute(params)

      return reply.send(result)
    },
  )

  // Listar favoritos de um usuário específico (público)
  fastify.get(
    '/users/:userId/favorites',
    {
      schema: {
        params: z.object({
          userId: z.string(),
        }),
        querystring: z.object({
          page: z.coerce.number().int().min(1).default(1),
          limit: z.coerce.number().int().min(1).max(100).default(20),
        }),
      },
    },
    async (request, reply) => {
      const useCase = new ListFavoritesUseCase(favoriteRepository)
      const { userId } = request.params as { userId: string }
      const query = request.query as any

      const result = await useCase.execute({
        userId,
        page: query.page,
        limit: query.limit,
      })

      return reply.send(result)
    },
  )

  // Listar usuários que favoritaram uma receita (público)
  fastify.get(
    '/recipes/:recipeId/favorites',
    {
      schema: {
        params: z.object({
          recipeId: z.string(),
        }),
        querystring: z.object({
          page: z.coerce.number().int().min(1).default(1),
          limit: z.coerce.number().int().min(1).max(100).default(20),
        }),
      },
    },
    async (request, reply) => {
      const useCase = new ListFavoritesUseCase(favoriteRepository)
      const { recipeId } = request.params as { recipeId: string }
      const query = request.query as any

      const result = await useCase.execute({
        recipeId,
        page: query.page,
        limit: query.limit,
      })

      return reply.send(result)
    },
  )

  // Remover receita dos favoritos (autenticado)
  fastify.delete(
    '/favorites/:recipeId',
    {
      schema: {
        params: z.object({
          recipeId: z.string(),
        }),
      },
      preHandler: [getAuthMiddleware()],
    },
    async (request, reply) => {
      const useCase = new DeleteFavoriteUseCase(favoriteRepository)

      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const { recipeId } = request.params as { recipeId: string }

      const result = await useCase.execute({
        userId: request.user.id,
        recipeId,
      })

      return reply.send(result)
    },
  )
}
