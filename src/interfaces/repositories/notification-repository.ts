import type { BaseNotification, NotificationType } from '@/types/base/index.ts'

export interface CreateNotificationData {
  userId: string
  type: NotificationType
  title: string
  body: string
  data?: Record<string, unknown> | null
}

export interface ListNotificationsParams {
  page: number
  limit: number
}

export interface NotificationRepository {
  create(data: CreateNotificationData): Promise<BaseNotification>
  listByUser(
    userId: string,
    params: ListNotificationsParams,
  ): Promise<{ notifications: BaseNotification[]; total: number }>
  markAsRead(id: string, userId: string): Promise<BaseNotification | null>
  markAllAsRead(userId: string): Promise<number>
}
