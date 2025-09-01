import type {
  ShoppingListCreateParams,
  ShoppingListItemCreateParams,
  ShoppingListItemUpdateParams,
  ShoppingListUpdateParams,
} from '@/types/index.ts'
import type { ShoppingList, ShoppingListItem } from '@prisma/client'

export interface IShoppingListRepository {
  // Métodos para a lista principal
  findById(id: string): Promise<ShoppingList | null>
  findByUserId(userId: string): Promise<ShoppingList[]>
  create(data: ShoppingListCreateParams): Promise<ShoppingList>
  update(id: string, data: ShoppingListUpdateParams): Promise<ShoppingList>
  delete(id: string): Promise<void>

  // Métodos para os itens da lista
  addItemToList(
    listId: string,
    itemData: ShoppingListItemCreateParams,
  ): Promise<ShoppingListItem>
  updateItemInList(
    itemId: string,
    itemData: ShoppingListItemUpdateParams,
  ): Promise<ShoppingListItem>
  removeItemFromList(itemId: string): Promise<void>
}
