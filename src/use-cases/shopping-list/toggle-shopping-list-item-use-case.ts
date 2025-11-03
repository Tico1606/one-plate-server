import { NotFoundError } from '@/errors/not-found-error.ts'
import type { ShoppingListRepository } from '@/interfaces/repositories/shopping-list-repository.ts'

export interface ToggleShoppingListItemRequest {
  itemId: string
}

export interface ToggleShoppingListItemResponse {
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

export class ToggleShoppingListItemUseCase {
  constructor(private shoppingListRepository: ShoppingListRepository) {}

  async execute(
    request: ToggleShoppingListItemRequest,
  ): Promise<ToggleShoppingListItemResponse> {
    try {
      const item = await this.shoppingListRepository.toggleItemChecked(request.itemId)

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
    } catch {
      throw new NotFoundError('Item da lista não encontrado')
    }
  }
}
