import type {
  CreateNotificationData,
  ListNotificationsParams,
  NotificationRepository,
} from '@/interfaces/repositories/notification-repository.ts'
import type { BaseNotification } from '@/types/base/index.ts'
import { PrismaRepository } from './prisma-repository.ts'

export class PrismaNotificationRepository
  extends PrismaRepository
  implements NotificationRepository
{
  async create(data: CreateNotificationData): Promise<BaseNotification> {
    console.log('[NOTIFICATION][DB] Persistindo notificacao', {
      userId: data.userId,
      type: data.type,
      title: data.title,
    })

    const notification = await this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body,
        data: data.data ?? undefined,
      },
    })

    console.log('[NOTIFICATION][DB] Notificacao criada com sucesso', {
      notificationId: notification.id,
      userId: notification.userId,
    })

    return notification
  }

  async listByUser(
    userId: string,
    params: ListNotificationsParams,
  ): Promise<{ notifications: BaseNotification[]; total: number }> {
    const { page, limit } = params
    const skip = (page - 1) * limit

    const [notifications, total] = await Promise.all([
      this.prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.notification.count({ where: { userId } }),
    ])

    return { notifications, total }
  }

  async markAsRead(id: string, userId: string): Promise<BaseNotification | null> {
    const notification = await this.prisma.notification.findFirst({
      where: { id, userId },
    })

    if (!notification) {
      return null
    }

    if (notification.readAt) {
      return notification
    }

    const updated = await this.prisma.notification.update({
      where: { id: notification.id },
      data: {
        readAt: new Date(),
      },
    })

    return updated
  }

  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    })

    return result.count
  }
}
