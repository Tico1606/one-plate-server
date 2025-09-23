import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { categoryRepository } from '@/database/repositories.ts'
import { getAuthMiddleware } from '@/middleware/dev-auth.ts'
import {
  CreateCategoryUseCase,
  DeleteCategoryUseCase,
  GetCategoryByIdUseCase,
  ListCategoriesUseCase,
  UpdateCategoryUseCase,
} from '@/use-cases/categories/index.ts'

// Schemas de validação
const createCategorySchema = z.object({
  name: z.string().min(1, 'Nome da categoria é obrigatório'),
})

const updateCategorySchema = z.object({
  name: z.string().min(1, 'Nome da categoria é obrigatório'),
})

const listCategoriesSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
})

export async function categoriesRoutes(fastify: FastifyInstance) {
  // Listar categorias (público)
  fastify.get(
    '/categories',
    {
      schema: {
        querystring: listCategoriesSchema,
      },
    },
    async (request, reply) => {
      const useCase = new ListCategoriesUseCase(categoryRepository)
      const result = await useCase.execute(request.query as any)

      return reply.send(result)
    },
  )

  // Buscar categoria por ID (público)
  fastify.get(
    '/categories/:id',
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const useCase = new GetCategoryByIdUseCase(categoryRepository)
      const result = await useCase.execute({ id })

      return reply.send(result)
    },
  )

  // Criar categoria (apenas admin)
  fastify.post(
    '/categories',
    {
      schema: {
        body: createCategorySchema,
      },
      preHandler: [getAuthMiddleware()],
    },
    async (request, reply) => {
      const useCase = new CreateCategoryUseCase(categoryRepository)
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      // Verificar se é admin
      if (request.user.role !== 'ADMIN') {
        return reply
          .status(403)
          .send({ message: 'Apenas administradores podem criar categorias' })
      }

      const result = await useCase.execute(request.body as any)

      return reply.status(201).send(result)
    },
  )

  // Atualizar categoria (apenas admin)
  fastify.put(
    '/categories/:id',
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
        body: updateCategorySchema,
      },
      preHandler: [getAuthMiddleware()],
    },
    async (request, reply) => {
      const { id } = request.params as { id: string }
      const useCase = new UpdateCategoryUseCase(categoryRepository)
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      // Verificar se é admin
      if (request.user.role !== 'ADMIN') {
        return reply
          .status(403)
          .send({ message: 'Apenas administradores podem atualizar categorias' })
      }

      const result = await useCase.execute({
        id,
        ...(request.body as any),
      })

      return reply.send(result)
    },
  )

  // Deletar categoria (apenas admin)
  fastify.delete(
    '/categories/:id',
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
      const useCase = new DeleteCategoryUseCase(categoryRepository)
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      // Verificar se é admin
      if (request.user.role !== 'ADMIN') {
        return reply
          .status(403)
          .send({ message: 'Apenas administradores podem deletar categorias' })
      }

      await useCase.execute({ id })

      return reply.status(204).send()
    },
  )
}
