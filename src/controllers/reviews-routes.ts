import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { reviewRepository } from '@/database/repositories.ts'
import { getAuthMiddleware } from '@/middleware/dev-auth.ts'
import {
  CreateReviewUseCase,
  DeleteReviewUseCase,
  GetReviewsByRecipeUseCase,
  UpdateReviewUseCase,
} from '@/use-cases/reviews/index.ts'

// Schemas de validação
const createReviewSchema = z.object({
  recipeId: z.string().min(1, 'ID da receita é obrigatório'),
  rating: z.number().int().min(1).max(5, 'Rating deve ser entre 1 e 5'),
  comment: z.string().optional(),
})

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5, 'Rating deve ser entre 1 e 5').optional(),
  comment: z.string().optional(),
})

const listReviewsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export async function reviewsRoutes(fastify: FastifyInstance) {
  // Criar avaliação (autenticado)
  fastify.post(
    '/reviews',
    {
      schema: {
        body: createReviewSchema,
      },
      preHandler: [getAuthMiddleware()],
    },
    async (request, reply) => {
      const useCase = new CreateReviewUseCase(reviewRepository)
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const result = await useCase.execute({
        ...(request.body as any),
        userId: request.user.id,
      })

      return reply.status(201).send(result)
    },
  )

  // Atualizar avaliação (autenticado, apenas o próprio usuário)
  fastify.put(
    '/reviews/:id',
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
        body: updateReviewSchema,
      },
      preHandler: [getAuthMiddleware()],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const useCase = new UpdateReviewUseCase(reviewRepository)
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const result = await useCase.execute({
        reviewId: id,
        userId: request.user.id,
        ...(request.body as any),
      })

      return reply.send(result)
    },
  )

  // Deletar avaliação (autenticado, apenas o próprio usuário)
  fastify.delete(
    '/reviews/:id',
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
      },
      preHandler: [getAuthMiddleware()],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const useCase = new DeleteReviewUseCase(reviewRepository)
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      await useCase.execute({
        reviewId: id,
        userId: request.user.id,
      })

      return reply.status(204).send()
    },
  )

  // Listar avaliações de uma receita (público)
  fastify.get(
    '/recipes/:recipeId/reviews',
    {
      schema: {
        params: z.object({
          recipeId: z.string(),
        }),
        querystring: listReviewsSchema,
      },
    },
    async (request, reply) => {
      const { recipeId } = request.params as { recipeId: string }
      const useCase = new GetReviewsByRecipeUseCase(reviewRepository)

      const result = await useCase.execute({
        recipeId,
        ...(request.query as any),
      })

      return reply.send(result)
    },
  )
}
