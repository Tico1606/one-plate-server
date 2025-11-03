import type {
  CreateShoppingListItemData,
  ShoppingListRepository,
} from '@/interfaces/repositories/shopping-list-repository.ts'

export interface AddItemToShoppingListRequest extends CreateShoppingListItemData {
  userId: string
}

export interface AddItemToShoppingListResponse {
  item: {
    id: string
    listId: string
    ingredientId?: string | null
    recipeId?: string | null
    customText?: string | null
    amount?: number | null
    unit?: string | null
    isChecked: boolean
    createdAt: Date
    updatedAt: Date
  }
}

export class AddItemToShoppingListUseCase {
  constructor(private shoppingListRepository: ShoppingListRepository) {}

  async execute(
    request: AddItemToShoppingListRequest,
  ): Promise<AddItemToShoppingListResponse> {
    const { userId, ...itemData } = request

    const item = await this.shoppingListRepository.addItemToList(userId, itemData)

    return {
      item: {
        id: item.id,
        listId: item.listId,
        ingredientId: item.ingredientId,
        recipeId: item.recipeId,
        customText: item.customText,
        amount: item.amount,
        unit: item.unit,
        isChecked: item.isChecked,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    }
  }
}
