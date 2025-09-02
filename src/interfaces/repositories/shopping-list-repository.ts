import type {
  BaseShoppingList,
  BaseShoppingListItem,
  ShoppingListWithRelations,
} from '@/types/base/index.ts'

export interface ShoppingListRepository {
  // Métodos para a lista principal
  findById(id: string): Promise<BaseShoppingList | null>
  findByIdWithRelations(id: string): Promise<ShoppingListWithRelations | null>
  findByUserId(
    userId: string,
    params: ListShoppingListsParams,
  ): Promise<{ lists: BaseShoppingList[]; total: number }>
  findByUserIdWithRelations(
    userId: string,
    params: ListShoppingListsParams,
  ): Promise<{ lists: ShoppingListWithRelations[]; total: number }>
  create(data: CreateShoppingListData): Promise<BaseShoppingList>
  update(id: string, data: UpdateShoppingListData): Promise<BaseShoppingList>
  delete(id: string): Promise<void>

  // Métodos para os itens da lista
  addItemToList(
    listId: string,
    itemData: CreateShoppingListItemData,
  ): Promise<BaseShoppingListItem>
  updateItemInList(
    itemId: string,
    itemData: UpdateShoppingListItemData,
  ): Promise<BaseShoppingListItem>
  removeItemFromList(itemId: string): Promise<void>
  getItemsByList(listId: string): Promise<BaseShoppingListItem[]>
  toggleItemChecked(itemId: string): Promise<BaseShoppingListItem>
  clearCheckedItems(listId: string): Promise<void>
}

export interface CreateShoppingListData {
  userId: string
  title?: string
}

export interface UpdateShoppingListData {
  title?: string
}

export interface CreateShoppingListItemData {
  ingredientId?: string | null
  recipeId?: string | null
  customText?: string | null
  amount?: number | null
  unit?: string | null
}

export interface UpdateShoppingListItemData {
  ingredientId?: string | null
  recipeId?: string | null
  customText?: string | null
  amount?: number | null
  unit?: string | null
  isChecked?: boolean
}

export interface ListShoppingListsParams {
  page: number
  limit: number
}
