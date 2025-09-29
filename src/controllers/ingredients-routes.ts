import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { ingredientRepository } from '@/database/repositories.ts'
import { getAuthMiddleware } from '@/middleware/dev-auth.ts'
import {
  CreateIngredientUseCase,
  DeleteIngredientUseCase,
  GetIngredientByIdUseCase,
  ListIngredientsUseCase,
  UpdateIngredientUseCase,
} from '@/use-cases/ingredients/index.ts'

// Schemas de validação
const createIngredientSchema = z.object({
  name: z.string().min(1, 'Nome do ingrediente é obrigatório'),
  description: z.string().optional(),
  imageUrl: z.string().url().optional(),
})

const updateIngredientSchema = createIngredientSchema.partial()

const listIngredientsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.enum(['name', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export async function ingredientsRoutes(fastify: FastifyInstance) {
  // Listar ingredientes (público)
  fastify.get(
    '/ingredients',
    {
      schema: {
        querystring: listIngredientsSchema,
      },
    },
    async (request, reply) => {
      const useCase = new ListIngredientsUseCase(ingredientRepository)
      const result = await useCase.execute(request.query as any)

      return reply.send(result)
    },
  )

  // Buscar ingrediente por ID (público)
  fastify.get(
    '/ingredients/:id',
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const useCase = new GetIngredientByIdUseCase(ingredientRepository)
      const result = await useCase.execute({ ingredientId: id })

      return reply.send(result)
    },
  )

  // Criar ingrediente (apenas admin)
  fastify.post(
    '/ingredients',
    {
      schema: {
        body: createIngredientSchema,
      },
      preHandler: [getAuthMiddleware()],
    },
    async (request, reply) => {
      const useCase = new CreateIngredientUseCase(ingredientRepository)
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const result = await useCase.execute(request.body as any)

      return reply.status(201).send(result)
    },
  )

  // Atualizar ingrediente (apenas admin)
  fastify.put(
    '/ingredients/:id',
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
        body: updateIngredientSchema,
      },
      preHandler: [getAuthMiddleware()],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const useCase = new UpdateIngredientUseCase(ingredientRepository)
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      // Verificar se é admin
      if (request.user.role !== 'ADMIN') {
        return reply
          .status(403)
          .send({ message: 'Apenas administradores podem atualizar ingredientes' })
      }

      const result = await useCase.execute({
        ingredientId: id,
        ...(request.body as any),
      })

      return reply.send(result)
    },
  )

  // Deletar ingrediente (apenas admin)
  fastify.delete(
    '/ingredients/:id',
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
      const useCase = new DeleteIngredientUseCase(ingredientRepository)
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      // Verificar se é admin
      if (request.user.role !== 'ADMIN') {
        return reply
          .status(403)
          .send({ message: 'Apenas administradores podem deletar ingredientes' })
      }

      await useCase.execute({ ingredientId: id })

      return reply.status(204).send()
    },
  )
}
