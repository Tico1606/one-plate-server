import type {
  ShoppingListRepository,
  UpdateShoppingListData,
} from '@/interfaces/repositories/shopping-list-repository.ts'

export interface UpdateShoppingListRequest extends UpdateShoppingListData {
  userId: string
}

export interface UpdateShoppingListResponse {
  shoppingList: {
    id: string
    userId: string
    title: string
    createdAt: Date
    updatedAt: Date
  }
}

export class UpdateShoppingListUseCase {
  constructor(private shoppingListRepository: ShoppingListRepository) {}

  async execute(request: UpdateShoppingListRequest): Promise<UpdateShoppingListResponse> {
    const { userId, ...updateData } = request

    // Verificar se a lista existe, se não existir, criar automaticamente
    let existingList = await this.shoppingListRepository.findByUserId(userId)
    if (!existingList) {
      existingList = await this.shoppingListRepository.create({ userId })
    }

    const shoppingList = await this.shoppingListRepository.update(userId, updateData)

    return {
      shoppingList: {
        id: shoppingList.id,
        userId: shoppingList.userId,
        title: shoppingList.title,
        createdAt: shoppingList.createdAt,
        updatedAt: shoppingList.updatedAt,
      },
    }
  }
}
