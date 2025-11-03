import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { shoppingListRepository } from '@/database/repositories.ts'
import { getAuthMiddleware } from '@/middleware/dev-auth.ts'
import {
  AddItemToShoppingListUseCase,
  ClearCheckedItemsUseCase,
  CreateShoppingListUseCase,
  DeleteShoppingListUseCase,
  GetShoppingListByUserIdUseCase,
  RemoveItemFromShoppingListUseCase,
  ToggleShoppingListItemUseCase,
  UpdateShoppingListItemUseCase,
  UpdateShoppingListUseCase,
} from '@/use-cases/shopping-list/index.ts'

// Schemas de validação
const createShoppingListSchema = z.object({
  title: z.string().optional(),
})

const updateShoppingListSchema = z.object({
  title: z.string().optional(),
})

const addItemSchema = z.object({
  ingredientId: z.string().optional(),
  recipeId: z.string().optional(),
  customText: z.string().optional(),
  amount: z.number().optional(),
  unit: z.string().optional(),
})

const updateItemSchema = z.object({
  ingredientId: z.string().optional(),
  recipeId: z.string().optional(),
  customText: z.string().optional(),
  amount: z.number().optional(),
  unit: z.string().optional(),
  isChecked: z.boolean().optional(),
})

export async function shoppingListRoutes(fastify: FastifyInstance) {
  // Criar lista de compras (apenas se não existir)
  fastify.post(
    '/shopping-list',
    {
      schema: {
        body: createShoppingListSchema,
      },
      preHandler: [getAuthMiddleware()],
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const useCase = new CreateShoppingListUseCase(shoppingListRepository)
      const result = await useCase.execute({
        userId: request.user.id,
        ...(request.body as any),
      })

      return reply.status(201).send(result)
    },
  )

  // Buscar lista de compras do usuário
  fastify.get(
    '/shopping-list',
    {
      preHandler: [getAuthMiddleware()],
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const useCase = new GetShoppingListByUserIdUseCase(shoppingListRepository)
      const result = await useCase.execute({ userId: request.user.id })

      return reply.send(result)
    },
  )

  // Atualizar lista de compras
  fastify.put(
    '/shopping-list',
    {
      schema: {
        body: updateShoppingListSchema,
      },
      preHandler: [getAuthMiddleware()],
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const useCase = new UpdateShoppingListUseCase(shoppingListRepository)
      const result = await useCase.execute({
        userId: request.user.id,
        ...(request.body as any),
      })

      return reply.send(result)
    },
  )

  // Deletar lista de compras
  fastify.delete(
    '/shopping-list',
    {
      preHandler: [getAuthMiddleware()],
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const useCase = new DeleteShoppingListUseCase(shoppingListRepository)
      await useCase.execute({ userId: request.user.id })

      return reply.status(204).send()
    },
  )

  // Adicionar item à lista
  fastify.post(
    '/shopping-list/items',
    {
      schema: {
        body: addItemSchema,
      },
      preHandler: [getAuthMiddleware()],
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const useCase = new AddItemToShoppingListUseCase(shoppingListRepository)
      const result = await useCase.execute({
        userId: request.user.id,
        ...(request.body as any),
      })

      return reply.status(201).send(result)
    },
  )

  // Atualizar item da lista
  fastify.put(
    '/shopping-list/items/:itemId',
    {
      schema: {
        params: z.object({
          itemId: z.string(),
        }),
        body: updateItemSchema,
      },
      preHandler: [getAuthMiddleware()],
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const { itemId } = request.params as { itemId: string }
      const useCase = new UpdateShoppingListItemUseCase(shoppingListRepository)
      const result = await useCase.execute({
        itemId,
        ...(request.body as any),
      })

      return reply.send(result)
    },
  )

  // Toggle item (marcar/desmarcar como comprado)
  fastify.put(
    '/shopping-list/items/:itemId/toggle',
    {
      schema: {
        params: z.object({
          itemId: z.string(),
        }),
      },
      preHandler: [getAuthMiddleware()],
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const { itemId } = request.params as { itemId: string }
      const useCase = new ToggleShoppingListItemUseCase(shoppingListRepository)
      const result = await useCase.execute({ itemId })

      return reply.send(result)
    },
  )

  // Remover item da lista
  fastify.delete(
    '/shopping-list/items/:itemId',
    {
      schema: {
        params: z.object({
          itemId: z.string(),
        }),
      },
      preHandler: [getAuthMiddleware()],
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const { itemId } = request.params as { itemId: string }
      const useCase = new RemoveItemFromShoppingListUseCase(shoppingListRepository)
      await useCase.execute({ itemId })

      return reply.status(204).send()
    },
  )

  // Limpar itens marcados como comprados
  fastify.delete(
    '/shopping-list/checked-items',
    {
      preHandler: [getAuthMiddleware()],
    },
    async (request, reply) => {
      if (!request.user) {
        return reply.status(401).send({ message: 'Usuário não autenticado' })
      }

      const useCase = new ClearCheckedItemsUseCase(shoppingListRepository)
      await useCase.execute({ userId: request.user.id })

      return reply.status(204).send()
    },
  )
}
