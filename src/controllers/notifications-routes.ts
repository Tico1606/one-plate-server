import type { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { env, HTTP_STATUS_CODE } from '@/constants/index.ts'
import {
  notificationRepository,
  pushSubscriptionRepository,
} from '@/database/repositories.ts'
import { authMiddleware } from '@/middleware/auth.ts'
import type { PushNotificationPayload } from '@/services/notification-service.ts'
import { NotificationService } from '@/services/notification-service.ts'
import type { BaseNotification } from '@/types/base/index.ts'

const expoPushTokenSchema = z
  .string()
  .regex(/^Expo(nent)?PushToken\[[\w-]+\]$/i, { message: 'Expo push token invalido' })

const deviceInfoSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().optional(),
    model: z.string().optional(),
    os: z.string().optional(),
  })
  .optional()

const createSubscriptionSchema = z.object({
  expoPushToken: expoPushTokenSchema,
  device: deviceInfoSchema,
})

const deleteSubscriptionSchema = z.object({
  expoPushToken: expoPushTokenSchema,
})

const testNotificationSchema = z.object({
  title: z.string(),
  body: z.string(),
})

const listNotificationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
})

const notificationParamsSchema = z.object({
  id: z.string(),
})

const notificationTypeEnum = z.enum(['RECIPE_REVIEW', 'RECIPE_FAVORITE', 'GENERAL'])

const notificationResponseSchema = z.object({
  id: z.string(),
  type: notificationTypeEnum,
  title: z.string(),
  body: z.string(),
  data: z.record(z.any()).nullable(),
  read: z.boolean(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
})

type CreateSubscriptionBody = z.infer<typeof createSubscriptionSchema>
type DeleteSubscriptionBody = z.infer<typeof deleteSubscriptionSchema>
type TestNotificationBody = z.infer<typeof testNotificationSchema>
type ListNotificationsQuery = z.infer<typeof listNotificationsQuerySchema>
type NotificationParams = z.infer<typeof notificationParamsSchema>

function serializeNotification(notification: BaseNotification) {
  return {
    id: notification.id,
    type: notification.type,
    title: notification.title,
    body: notification.body,
    data: (notification.data as Record<string, unknown> | null) ?? null,
    read: Boolean(notification.readAt),
    readAt: notification.readAt ? notification.readAt.toISOString() : null,
    createdAt: notification.createdAt.toISOString(),
  }
}

export async function notificationRoutes(app: FastifyInstance) {
  const notificationService = NotificationService.getInstance()

  // Registrar push subscription
  app.post<{ Body: CreateSubscriptionBody }>(
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
              expoPushToken: z.string(),
              createdAt: z.string(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { expoPushToken, device } = request.body
      const user = request.user

      app.log.info(
        {
          path: '/notifications/subscribe',
          userId: user?.id ?? null,
          hasToken: Boolean(expoPushToken),
          expoPushToken,
        },
        '[NOTIFICATIONS][SUBSCRIBE] Requisicao recebida',
      )

      if (!user) {
        return reply.status(HTTP_STATUS_CODE.unauthorized).send({
          message: 'Usuario nao autenticado',
        })
      }

      const userId = user.id

      try {
        // Verificar se ja existe uma subscription com este token
        const existingSubscription =
          await pushSubscriptionRepository.findByToken(expoPushToken)

        if (existingSubscription) {
          // Se ja existe e e do mesmo usuario, retornar sucesso
          if (existingSubscription.userId === userId) {
            app.log.info(
              {
                userId,
                subscriptionId: existingSubscription.id,
                expoPushToken: existingSubscription.expoPushToken,
              },
              '[NOTIFICATIONS][SUBSCRIBE] Token ja cadastrado para este usuario',
            )
            return reply.status(HTTP_STATUS_CODE.ok).send({
              message: 'Subscription ja existe',
              subscription: {
                id: existingSubscription.id,
                expoPushToken: existingSubscription.expoPushToken,
                createdAt: existingSubscription.createdAt.toISOString(),
              },
            })
          } else {
            // Se e de outro usuario, deletar a antiga e criar nova
            await pushSubscriptionRepository.deleteByToken(expoPushToken)
            app.log.warn(
              {
                previousUserId: existingSubscription.userId,
                userId,
                expoPushToken,
              },
              '[NOTIFICATIONS][SUBSCRIBE] Token estava associado a outro usuario, removendo e recriando',
            )
          }
        }

        const subscription = await pushSubscriptionRepository.create({
          userId,
          expoPushToken,
          deviceInfo: device ?? undefined,
        })

        app.log.info(
          {
            userId,
            subscriptionId: subscription.id,
            expoPushToken: subscription.expoPushToken,
            deviceInfo: device ?? null,
          },
          '[NOTIFICATIONS][SUBSCRIBE] Token registrado com sucesso',
        )

        return reply.status(HTTP_STATUS_CODE.created).send({
          message: 'Push subscription registrada com sucesso',
          subscription: {
            id: subscription.id,
            expoPushToken: subscription.expoPushToken,
            createdAt: subscription.createdAt.toISOString(),
          },
        })
      } catch (error) {
        app.log.error({ err: error }, 'Erro ao registrar push subscription')
        return reply.status(HTTP_STATUS_CODE.serverError).send({
          message: 'Erro interno do servidor',
        })
      }
    },
  )

  // Remover push subscription
  app.delete<{ Body: DeleteSubscriptionBody }>(
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
      const { expoPushToken } = request.body
      const user = request.user

      if (!user) {
        return reply.status(HTTP_STATUS_CODE.unauthorized).send({
          message: 'Usuario nao autenticado',
        })
      }

      const userId = user.id

      try {
        const subscription = await pushSubscriptionRepository.findByToken(expoPushToken)

        if (!subscription) {
          return reply.status(HTTP_STATUS_CODE.notFound).send({
            message: 'Subscription nao encontrada',
          })
        }

        if (subscription.userId !== userId) {
          return reply.status(HTTP_STATUS_CODE.unauthorized).send({
            message: 'Voce nao tem permissao para remover esta subscription',
          })
        }

        await pushSubscriptionRepository.deleteByToken(expoPushToken)

        return reply.status(HTTP_STATUS_CODE.ok).send({
          message: 'Push subscription removida com sucesso',
        })
      } catch (error) {
        app.log.error({ err: error }, 'Erro ao remover push subscription')
        return reply.status(HTTP_STATUS_CODE.serverError).send({
          message: 'Erro interno do servidor',
        })
      }
    },
  )

  // Listar subscriptions do usuario
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
                expoPushToken: z.string(),
                createdAt: z.string(),
                updatedAt: z.string(),
                device: z.record(z.any()).nullable(),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const user = request.user

      if (!user) {
        return reply.status(HTTP_STATUS_CODE.unauthorized).send({
          message: 'Usuario nao autenticado',
        })
      }

      const userId = user.id

      try {
        const subscriptions = await pushSubscriptionRepository.findByUserId(userId)

        return reply.status(HTTP_STATUS_CODE.ok).send({
          subscriptions: subscriptions.map((sub) => ({
            id: sub.id,
            expoPushToken: sub.expoPushToken,
            createdAt: sub.createdAt.toISOString(),
            updatedAt: sub.updatedAt.toISOString(),
            device: sub.deviceInfo ?? null,
          })),
        })
      } catch (error) {
        app.log.error({ err: error }, 'Erro ao listar subscriptions')
        return reply.status(HTTP_STATUS_CODE.serverError).send({
          message: 'Erro interno do servidor',
        })
      }
    },
  )

  // Remover todas as subscriptions do usuario (logout)
  app.delete(
    '/notifications/subscriptions',
    {
      preHandler: [authMiddleware],
      schema: {
        response: {
          200: z.object({
            message: z.string(),
            removedCount: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const user = request.user

      if (!user) {
        return reply.status(HTTP_STATUS_CODE.unauthorized).send({
          message: 'Usuario nao autenticado',
        })
      }

      try {
        const removedCount = await pushSubscriptionRepository.deleteByUserId(user.id)

        return reply.status(HTTP_STATUS_CODE.ok).send({
          message:
            removedCount > 0
              ? 'Push subscriptions removidas com sucesso'
              : 'Nao havia subscriptions registradas',
          removedCount,
        })
      } catch (error) {
        app.log.error({ err: error }, 'Erro ao remover subscriptions do usuario')
        return reply.status(HTTP_STATUS_CODE.serverError).send({
          message: 'Erro interno do servidor',
        })
      }
    },
  )

  // Listar notificacoes persistidas
  app.get<{ Querystring: ListNotificationsQuery }>(
    '/notifications',
    {
      preHandler: [authMiddleware],
      schema: {
        querystring: listNotificationsQuerySchema,
        response: {
          200: z.object({
            notifications: z.array(notificationResponseSchema),
            pagination: z.object({
              page: z.number(),
              limit: z.number(),
              total: z.number(),
              totalPages: z.number(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const user = request.user

      if (!user) {
        return reply.status(HTTP_STATUS_CODE.unauthorized).send({
          message: 'Usuario nao autenticado',
        })
      }

      const { page, limit } = listNotificationsQuerySchema.parse(request.query)

      try {
        const { notifications, total } = await notificationRepository.listByUser(
          user.id,
          {
            page,
            limit,
          },
        )

        return reply.status(HTTP_STATUS_CODE.ok).send({
          notifications: notifications.map(serializeNotification),
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        })
      } catch (error) {
        app.log.error({ err: error }, 'Erro ao listar notificacoes')
        return reply.status(HTTP_STATUS_CODE.serverError).send({
          message: 'Erro interno do servidor',
        })
      }
    },
  )

  // Marcar todas as notificacoes como lidas
  app.patch(
    '/notifications/read-all',
    {
      preHandler: [authMiddleware],
      schema: {
        response: {
          200: z.object({
            message: z.string(),
            updatedCount: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const user = request.user

      if (!user) {
        return reply.status(HTTP_STATUS_CODE.unauthorized).send({
          message: 'Usuario nao autenticado',
        })
      }

      try {
        const updatedCount = await notificationRepository.markAllAsRead(user.id)

        return reply.status(HTTP_STATUS_CODE.ok).send({
          message:
            updatedCount > 0
              ? 'Notificacoes marcadas como lidas'
              : 'Nao havia notificacoes pendentes',
          updatedCount,
        })
      } catch (error) {
        app.log.error({ err: error }, 'Erro ao marcar notificacoes como lidas')
        return reply.status(HTTP_STATUS_CODE.serverError).send({
          message: 'Erro interno do servidor',
        })
      }
    },
  )

  // Marcar notificacao especifica como lida
  app.patch<{ Params: NotificationParams }>(
    '/notifications/:id/read',
    {
      preHandler: [authMiddleware],
      schema: {
        params: notificationParamsSchema,
        response: {
          200: z.object({
            message: z.string(),
            notification: notificationResponseSchema,
          }),
        },
      },
    },
    async (request, reply) => {
      const user = request.user

      if (!user) {
        return reply.status(HTTP_STATUS_CODE.unauthorized).send({
          message: 'Usuario nao autenticado',
        })
      }

      const { id } = notificationParamsSchema.parse(request.params)

      try {
        const notification = await notificationRepository.markAsRead(id, user.id)

        if (!notification) {
          return reply.status(HTTP_STATUS_CODE.notFound).send({
            message: 'Notificacao nao encontrada',
          })
        }

        return reply.status(HTTP_STATUS_CODE.ok).send({
          message: 'Notificacao marcada como lida',
          notification: serializeNotification(notification),
        })
      } catch (error) {
        app.log.error({ err: error }, 'Erro ao marcar notificacao como lida')
        return reply.status(HTTP_STATUS_CODE.serverError).send({
          message: 'Erro interno do servidor',
        })
      }
    },
  )

  // Verificar status das notificacoes
  app.get(
    '/notifications/status',
    {
      preHandler: [authMiddleware],
      schema: {
        response: {
          200: z.object({
            hasTokens: z.boolean(),
            tokenCount: z.number(),
            expoAccessTokenConfigured: z.boolean(),
            environment: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const user = request.user

      if (!user) {
        return reply.status(HTTP_STATUS_CODE.unauthorized).send({
          message: 'Usuario nao autenticado',
        })
      }

      const userId = user.id

      try {
        const subscriptions = await pushSubscriptionRepository.findByUserId(userId)

        app.log.info(
          {
            path: '/notifications/status',
            userId,
            tokenCount: subscriptions.length,
            tokens: subscriptions.map((sub) => sub.expoPushToken),
          },
          '[NOTIFICATIONS][STATUS] Tokens recuperados para o usuario',
        )

        return reply.status(HTTP_STATUS_CODE.ok).send({
          hasTokens: subscriptions.length > 0,
          tokenCount: subscriptions.length,
          expoAccessTokenConfigured: Boolean(env.EXPO_ACCESS_TOKEN),
          environment: env.NODE_ENV,
        })
      } catch (error) {
        app.log.error({ err: error }, 'Erro ao verificar status das notificacoes')
        return reply.status(HTTP_STATUS_CODE.serverError).send({
          message: 'Erro interno do servidor',
        })
      }
    },
  )

  // Endpoint para testar notificacoes (apenas para desenvolvimento)
  app.post<{ Body: TestNotificationBody }>(
    '/notifications/test',
    {
      preHandler: [authMiddleware],
      schema: {
        body: testNotificationSchema,
        response: {
          200: z.object({
            message: z.string(),
            notification: notificationResponseSchema,
          }),
        },
      },
    },
    async (request, reply) => {
      const { title, body } = request.body
      const user = request.user

      if (!user) {
        return reply.status(HTTP_STATUS_CODE.unauthorized).send({
          message: 'Usuario nao autenticado',
        })
      }

      const userId = user.id

      try {
        const subscriptions = await pushSubscriptionRepository.findByUserId(userId)

        if (subscriptions.length === 0) {
          return reply.status(HTTP_STATUS_CODE.badRequest).send({
            message: 'Nenhum token Expo encontrado para este usuario',
          })
        }

        const payload: PushNotificationPayload = { title, body }
        const notification = await notificationRepository.create({
          userId,
          type: 'GENERAL',
          title: payload.title,
          body: payload.body,
          data: payload.data ?? null,
        })

        await notificationService.sendNotificationToUser(
          userId,
          payload,
          async (userId) => {
            const subs = await pushSubscriptionRepository.findByUserId(userId)
            return subs.map((sub) => sub.expoPushToken)
          },
        )

        return reply.status(HTTP_STATUS_CODE.ok).send({
          message: 'Notificacao de teste enviada com sucesso',
          notification: serializeNotification(notification),
        })
      } catch (error) {
        app.log.error({ err: error }, 'Erro ao enviar notificacao de teste')
        return reply.status(HTTP_STATUS_CODE.serverError).send({
          message: 'Erro interno do servidor',
        })
      }
    },
  )
}
