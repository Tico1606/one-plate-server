import type {
  ShoppingListRepository,
  UpdateShoppingListItemData,
} from '@/interfaces/repositories/shopping-list-repository.ts'

export interface UpdateShoppingListItemRequest extends UpdateShoppingListItemData {
  itemId: string
}

export interface UpdateShoppingListItemResponse {
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

export class UpdateShoppingListItemUseCase {
  constructor(private shoppingListRepository: ShoppingListRepository) {}

  async execute(
    request: UpdateShoppingListItemRequest,
  ): Promise<UpdateShoppingListItemResponse> {
    const { itemId, ...updateData } = request

    const item = await this.shoppingListRepository.updateItemInList(itemId, updateData)

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
