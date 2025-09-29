import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { recipeRepository } from '@/database/repositories.ts'
import { getAuthMiddleware, getOptionalAuthMiddleware } from '@/middleware/dev-auth.ts'
import {
  CreateRecipeUseCase,
  DeleteRecipeUseCase,
  GetRecipeByIdUseCase,
  ListRecipesUseCase,
  UpdateRecipeUseCase,
} from '@/use-cases/recipes/index.ts'

// Schemas de validação
const createRecipeSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  prepTime: z.number().int().min(0),
  servings: z.number().int().min(1),
  videoUrl: z.string().url().optional(),
  source: z.string().optional(),
  calories: z.number().int().min(0).optional(),
  proteinGrams: z.number().min(0).optional(),
  carbGrams: z.number().min(0).optional(),
  fatGrams: z.number().min(0).optional(),
  photos: z
    .array(
      z.object({
        url: z.string().url(),
        order: z.coerce.number().int().min(0).default(0),
      }),
    )
    .default([]),
  steps: z
    .array(
      z.object({
        order: z.coerce.number().int().min(0),
        description: z.string().min(1, 'Descrição do passo é obrigatória'),
        durationSec: z.coerce.number().int().min(0).optional(),
      }),
    )
    .min(1, 'Pelo menos um passo é obrigatório'),
  ingredients: z
    .array(
      z.object({
        ingredientId: z.string(),
        amount: z.coerce.number().min(0).optional(),
        unit: z.string().optional(),
        note: z.string().optional(),
        group: z.string().optional(),
      }),
    )
    .min(1, 'Pelo menos um ingrediente é obrigatório'),
  categories: z.array(z.string()).default([]),
})

const updateRecipeSchema = createRecipeSchema.partial()

const listRecipesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  category: z.string().optional(),
  ingredient: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  prepTime: z.coerce.number().int().min(0).optional(),
  servings: z.coerce.number().int().min(1).optional(),
  featured: z.coerce.boolean().optional(),
  sortBy: z
    .enum([
      'createdAt',
      'title',
      'prepTime',
      'calories',
      'favorites',
      'averageRating',
      'servings',
      'difficulty',
    ])
    .optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

export async function recipesRoutes(fastify: FastifyInstance) {
  // Listar receitas (público, com autenticação opcional)
  fastify.get(
    '/recipes',
    {
      schema: {
        querystring: listRecipesSchema,
      },
      preHandler: [getOptionalAuthMiddleware()],
    },
    async (request, reply) => {
      const useCase = new ListRecipesUseCase(recipeRepository)
      const result = await useCase.execute({
        ...(request.query as any),
        userId: request.user?.id,
      })

      return reply.send(result)
    },
  )

  // Buscar receita por ID (público, com autenticação opcional)
  fastify.get(
    '/recipes/:id',
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
      },
      preHandler: [getOptionalAuthMiddleware()],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const useCase = new GetRecipeByIdUseCase(recipeRepository)
      const result = await useCase.execute({
        recipeId: id,
        userId: request.user?.id,
      })

      return reply.send(result)
    },
  )

  // Criar receita (autenticado)
  fastify.post(
    '/recipes',
    {
      schema: {
        body: createRecipeSchema,
      },
      preHandler: [getAuthMiddleware()],
    },
    async (request, reply) => {
      const useCase = new CreateRecipeUseCase(recipeRepository)
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const result = await useCase.execute({
        ...(request.body as any),
        authorId: request.user.id,
      })

      return reply.status(201).send(result)
    },
  )

  // Atualizar receita (autenticado, apenas autor)
  fastify.put(
    '/recipes/:id',
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
        body: updateRecipeSchema,
      },
      preHandler: [getAuthMiddleware()],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const useCase = new UpdateRecipeUseCase(recipeRepository)
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const result = await useCase.execute({
        recipeId: id,
        requesterId: request.user.id,
        requesterRole: request.user.role,
        ...(request.body as any),
      })

      return reply.send(result)
    },
  )

  // Deletar receita (autenticado, apenas autor)
  fastify.delete(
    '/recipes/:id',
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
      const useCase = new DeleteRecipeUseCase(recipeRepository)
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      await useCase.execute({
        recipeId: id,
        requesterId: request.user.id,
        requesterRole: request.user.role,
      })

      return reply.status(204).send()
    },
  )
}
