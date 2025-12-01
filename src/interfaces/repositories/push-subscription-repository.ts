export interface PushSubscriptionData {
  id: string
  userId: string
  expoPushToken: string
  deviceInfo?: Record<string, unknown> | null
  createdAt: Date
  updatedAt: Date
}

export interface CreatePushSubscriptionData {
  userId: string
  expoPushToken: string
  deviceInfo?: Record<string, unknown> | null
}

export interface IPushSubscriptionRepository {
  create(data: CreatePushSubscriptionData): Promise<PushSubscriptionData>
  findByUserId(userId: string): Promise<PushSubscriptionData[]>
  findByToken(token: string): Promise<PushSubscriptionData | null>
  delete(id: string): Promise<void>
  deleteByToken(token: string): Promise<void>
  deleteByUserId(userId: string): Promise<number>
}
