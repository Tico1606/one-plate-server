import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { recipeRepository } from '@/database/repositories.ts'
import { getAuthMiddleware, getOptionalAuthMiddleware } from '@/middleware/dev-auth.ts'
import {
  CreateRecipeUseCase,
  DeleteRecipeUseCase,
  GenerateRecipePdfUseCase,
  GetRecipeByIdUseCase,
  ListRecipesUseCase,
  PublishRecipeUseCase,
  UnpublishRecipeUseCase,
  UpdateRecipeUseCase,
} from '@/use-cases/recipes/index.ts'

// Schemas de validacao
const recipePhotoSchema = z.object({
  url: z.string().url(),
  order: z.coerce.number().int().min(0).default(0),
})

const recipeStepSchema = z.object({
  order: z.coerce.number().int().min(0),
  description: z.string().min(1, 'Descricao do passo e obrigatoria'),
  durationSec: z.coerce.number().int().min(0).optional(),
})

const recipeIngredientSchema = z.object({
  ingredientId: z.string(),
  amount: z.coerce.number().min(0).optional(),
  unit: z.string().optional(),
  note: z.string().optional(),
  group: z.string().optional(),
})

const imageUrlsSchema = z.preprocess(
  (val) => {
    if (val === undefined || val === null) {
      return undefined
    }

    if (Array.isArray(val)) {
      return val
    }

    if (typeof val === 'string') {
      const trimmed = val.trim()
      if (trimmed.length === 0) {
        return []
      }

      try {
        const parsed = JSON.parse(trimmed)
        if (Array.isArray(parsed)) {
          return parsed
        }
      } catch {
        // nao e JSON, tratar como URL unica
      }

      return [trimmed]
    }

    return val
  },
  z.array(z.string().url()).optional(),
)

const createRecipeSchema = z.object({
  title: z.string().min(1, 'Titulo e obrigatorio'),
  description: z.string().nullable().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).default('MEDIUM'),
  prepTime: z.number().int().min(0),
  servings: z.number().int().min(1),
  videoUrl: z.string().url().nullable().optional(),
  source: z.string().nullable().optional(),
  calories: z
    .union([z.number().int().min(0), z.literal('-'), z.string().min(1)])
    .nullable()
    .optional(),
  proteinGrams: z
    .union([z.number().min(0), z.literal('-'), z.string().min(1)])
    .nullable()
    .optional(),
  carbGrams: z
    .union([z.number().min(0), z.literal('-'), z.string().min(1)])
    .nullable()
    .optional(),
  fatGrams: z
    .union([z.number().min(0), z.literal('-'), z.string().min(1)])
    .nullable()
    .optional(),
  photos: z.array(recipePhotoSchema).optional(),
  images: imageUrlsSchema,
  steps: z.array(recipeStepSchema).min(1, 'Pelo menos um passo e obrigatorio'),
  ingredients: z
    .array(recipeIngredientSchema)
    .min(1, 'Pelo menos um ingrediente e obrigatorio'),
  categories: z.array(z.string()).default([]),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional().default('DRAFT'),
})

const updateRecipeSchema = z.object({
  title: z.string().min(1, 'Titulo e obrigatorio').optional(),
  description: z.string().nullable().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  prepTime: z.number().int().min(0).optional(),
  servings: z.number().int().min(1).optional(),
  videoUrl: z.string().url().nullable().optional(),
  source: z.string().nullable().optional(),
  calories: z
    .union([z.number().int().min(0), z.literal('-'), z.string().min(1)])
    .nullable()
    .optional(),
  proteinGrams: z
    .union([z.number().min(0), z.literal('-'), z.string().min(1)])
    .nullable()
    .optional(),
  carbGrams: z
    .union([z.number().min(0), z.literal('-'), z.string().min(1)])
    .nullable()
    .optional(),
  fatGrams: z
    .union([z.number().min(0), z.literal('-'), z.string().min(1)])
    .nullable()
    .optional(),
  photos: z.array(recipePhotoSchema).optional(),
  images: imageUrlsSchema,
  steps: z.array(recipeStepSchema).optional(),
  ingredients: z.array(recipeIngredientSchema).optional(),
  categories: z.array(z.string()).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
})

function normalizeRecipePhotos(
  body: Record<string, any> | undefined,
  options: { ensureArray?: boolean } = {},
) {
  if (!body) {
    return
  }

  if (Array.isArray(body.images)) {
    body.photos = body.images.map((url: string, index: number) => ({
      url,
      order: index,
    }))
  } else if (Array.isArray(body.photos)) {
    body.photos = body.photos.map((photo: any, index: number) => ({
      url: photo.url,
      order:
        typeof photo.order === 'number' && Number.isFinite(photo.order) ? photo.order : index,
    }))
  } else if (options.ensureArray) {
    body.photos = []
  }

  if (Object.prototype.hasOwnProperty.call(body, 'images')) {
    delete body.images
  }
}

const listRecipesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  category: z.string().optional(), // Mantido para compatibilidade
  categories: z.preprocess((val) => {
    if (typeof val === 'string') return val.split(',').map((s) => s.trim())
    return val
  }, z.array(z.string()).optional()),
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
  // Listar receitas públicas (só receitas PUBLISHED)
  fastify.get(
    '/recipes',
    {
      schema: {
        querystring: listRecipesSchema,
      },
    },
    async (request, reply) => {
      const useCase = new ListRecipesUseCase(recipeRepository)

      // Lista geral só mostra receitas PUBLICADAS para todos (logados ou não)
      const result = await useCase.execute({
        ...(request.query as any),
        status: 'PUBLISHED', // Filtrar apenas receitas publicadas
      })

      return reply.send(result)
    },
  )

  // Listar receitas do usuário (incluindo rascunhos) - autenticado
  fastify.get(
    '/recipes/my-recipes',
    {
      schema: {
        querystring: z.object({
          page: z.coerce.number().int().min(1).default(1),
          limit: z.coerce.number().int().min(1).max(100).default(20),
          status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
        }),
      },
      preHandler: [getAuthMiddleware()],
    },
    async (request, reply) => {
      const useCase = new ListRecipesUseCase(recipeRepository)

      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const query = request.query as any
      const result = await useCase.execute({
        ...query,
        authorId: request.user.id, // Filtrar apenas receitas do usuário
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

  fastify.get(
    '/recipes/:id/pdf',
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
      const useCase = new GenerateRecipePdfUseCase(recipeRepository)

      const { buffer, filename } = await useCase.execute({
        recipeId: id,
        requesterId: request.user?.id,
        requesterRole: request.user?.role,
      })

      reply
        .header('Content-Type', 'application/pdf')
        .header('Content-Disposition', `attachment; filename="${filename}"`)

      return reply.send(buffer)
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

      const body = request.body as any
      normalizeRecipePhotos(body, { ensureArray: true })

      const result = await useCase.execute({
        ...body,
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

      const body = request.body as any
      normalizeRecipePhotos(body)

      const result = await useCase.execute({
        recipeId: id,
        requesterId: request.user.id,
        requesterRole: request.user.role,
        ...body,
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

  // Publicar receita (autenticado, apenas autor ou admin)
  fastify.put(
    '/recipes/:id/publish',
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
      const useCase = new PublishRecipeUseCase(recipeRepository)
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const result = await useCase.execute({
        recipeId: id,
        requesterId: request.user.id,
        requesterRole: request.user.role,
      })

      return reply.send(result)
    },
  )

  // Despublicar receita (autenticado, apenas autor ou admin)
  fastify.put(
    '/recipes/:id/unpublish',
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
      const useCase = new UnpublishRecipeUseCase(recipeRepository)
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const result = await useCase.execute({
        recipeId: id,
        requesterId: request.user.id,
        requesterRole: request.user.role,
      })

      return reply.send(result)
    },
  )
}
