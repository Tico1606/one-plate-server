export interface PushSubscriptionData {
  id: string
  userId: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
  createdAt: Date
}

export interface CreatePushSubscriptionData {
  userId: string
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export interface IPushSubscriptionRepository {
  create(data: CreatePushSubscriptionData): Promise<PushSubscriptionData>
  findByUserId(userId: string): Promise<PushSubscriptionData[]>
  findByEndpoint(endpoint: string): Promise<PushSubscriptionData | null>
  delete(id: string): Promise<void>
  deleteByEndpoint(endpoint: string): Promise<void>
}

