import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { env, HTTP_STATUS_CODE } from '@/constants/index.ts'
import { pushSubscriptionRepository } from '@/database/repositories.ts'
import { authMiddleware } from '@/middleware/auth.ts'
import { NotificationService } from '@/services/notification-service.ts'

const createSubscriptionSchema = z.object({
  endpoint: z.string().url(),
  keys: z.object({
    p256dh: z.string(),
    auth: z.string(),
  }),
})

const deleteSubscriptionSchema = z.object({
  endpoint: z.string().url(),
})

export async function notificationRoutes(app: FastifyInstance) {
  const notificationService = NotificationService.getInstance()

  // Registrar push subscription
  app.post(
    '/notifications/subscribe',
    {
      preHandler: [authMiddleware],
      schema: {
        body: createSubscriptionSchema,
        response: {
          201: z.object({
            message: z.string(),
            subscription: z.object({
              id: z.string(),
              endpoint: z.string(),
              createdAt: z.string(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { endpoint, keys } = request.body
      const userId = request.user.id

      try {
        // Verificar se já existe uma subscription com este endpoint
        const existingSubscription =
          await pushSubscriptionRepository.findByEndpoint(endpoint)

        if (existingSubscription) {
          // Se já existe e é do mesmo usuário, retornar sucesso
          if (existingSubscription.userId === userId) {
            return reply.status(HTTP_STATUS_CODE.OK).send({
              message: 'Subscription já existe',
              subscription: {
                id: existingSubscription.id,
                endpoint: existingSubscription.endpoint,
                createdAt: existingSubscription.createdAt.toISOString(),
              },
            })
          } else {
            // Se é de outro usuário, deletar a antiga e criar nova
            await pushSubscriptionRepository.deleteByEndpoint(endpoint)
          }
        }

        const subscription = await pushSubscriptionRepository.create({
          userId,
          endpoint,
          keys,
        })

        return reply.status(HTTP_STATUS_CODE.CREATED).send({
          message: 'Push subscription registrada com sucesso',
          subscription: {
            id: subscription.id,
            endpoint: subscription.endpoint,
            createdAt: subscription.createdAt.toISOString(),
          },
        })
      } catch (error) {
        app.log.error('Erro ao registrar push subscription:', error)
        return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
          message: 'Erro interno do servidor',
        })
      }
    },
  )

  // Remover push subscription
  app.delete(
    '/notifications/unsubscribe',
    {
      preHandler: [authMiddleware],
      schema: {
        body: deleteSubscriptionSchema,
        response: {
          200: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { endpoint } = request.body
      const userId = request.user.id

      try {
        const subscription = await pushSubscriptionRepository.findByEndpoint(endpoint)

        if (!subscription) {
          return reply.status(HTTP_STATUS_CODE.NOT_FOUND).send({
            message: 'Subscription não encontrada',
          })
        }

        if (subscription.userId !== userId) {
          return reply.status(HTTP_STATUS_CODE.FORBIDDEN).send({
            message: 'Você não tem permissão para remover esta subscription',
          })
        }

        await pushSubscriptionRepository.deleteByEndpoint(endpoint)

        return reply.status(HTTP_STATUS_CODE.OK).send({
          message: 'Push subscription removida com sucesso',
        })
      } catch (error) {
        app.log.error('Erro ao remover push subscription:', error)
        return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
          message: 'Erro interno do servidor',
        })
      }
    },
  )

  // Listar subscriptions do usuário
  app.get(
    '/notifications/subscriptions',
    {
      preHandler: [authMiddleware],
      schema: {
        response: {
          200: z.object({
            subscriptions: z.array(
              z.object({
                id: z.string(),
                endpoint: z.string(),
                createdAt: z.string(),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.id

      try {
        const subscriptions = await pushSubscriptionRepository.findByUserId(userId)

        return reply.status(HTTP_STATUS_CODE.OK).send({
          subscriptions: subscriptions.map((sub) => ({
            id: sub.id,
            endpoint: sub.endpoint,
            createdAt: sub.createdAt.toISOString(),
          })),
        })
      } catch (error) {
        app.log.error('Erro ao listar subscriptions:', error)
        return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
          message: 'Erro interno do servidor',
        })
      }
    },
  )

  // Verificar status das notificações
  app.get(
    '/notifications/status',
    {
      preHandler: [authMiddleware],
      schema: {
        response: {
          200: z.object({
            hasSubscriptions: z.boolean(),
            subscriptionCount: z.number(),
            vapidConfigured: z.boolean(),
            environment: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const userId = request.user.id

      try {
        const subscriptions = await pushSubscriptionRepository.findByUserId(userId)
        const vapidConfigured = !!(env.VAPID_PUBLIC_KEY && env.VAPID_PRIVATE_KEY)

        return reply.status(HTTP_STATUS_CODE.OK).send({
          hasSubscriptions: subscriptions.length > 0,
          subscriptionCount: subscriptions.length,
          vapidConfigured,
          environment: env.NODE_ENV,
        })
      } catch (error) {
        app.log.error('Erro ao verificar status das notificações:', error)
        return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
          message: 'Erro interno do servidor',
        })
      }
    },
  )

  // Endpoint para testar notificações (apenas para desenvolvimento)
  app.post(
    '/notifications/test',
    {
      preHandler: [authMiddleware],
      schema: {
        body: z.object({
          title: z.string(),
          body: z.string(),
        }),
        response: {
          200: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { title, body } = request.body
      const userId = request.user.id

      try {
        const subscriptions = await pushSubscriptionRepository.findByUserId(userId)

        if (subscriptions.length === 0) {
          return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
            message: 'Nenhuma subscription encontrada para este usuário',
          })
        }

        const payload = { title, body }

        await notificationService.sendNotificationToUser(
          userId,
          payload,
          async (userId) => {
            const subs = await pushSubscriptionRepository.findByUserId(userId)
            return subs.map((sub) => ({
              endpoint: sub.endpoint,
              keys: sub.keys,
            }))
          },
        )

        return reply.status(HTTP_STATUS_CODE.OK).send({
          message: 'Notificação de teste enviada com sucesso',
        })
      } catch (error) {
        app.log.error('Erro ao enviar notificação de teste:', error)
        return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
          message: 'Erro interno do servidor',
        })
      }
    },
  )
}
