import type {
  BaseShoppingList,
  BaseShoppingListItem,
  ShoppingListWithRelations,
} from '@/types/base/index.ts'

export interface ShoppingListRepository {
  // Métodos para a lista principal (agora única por usuário)
  findByUserId(userId: string): Promise<BaseShoppingList | null>
  findByUserIdWithRelations(userId: string): Promise<ShoppingListWithRelations | null>
  create(data: CreateShoppingListData): Promise<BaseShoppingList>
  update(userId: string, data: UpdateShoppingListData): Promise<BaseShoppingList>
  delete(userId: string): Promise<void>

  // Métodos para os itens da lista
  addItemToList(
    userId: string,
    itemData: CreateShoppingListItemData,
  ): Promise<BaseShoppingListItem>
  updateItemInList(
    itemId: string,
    itemData: UpdateShoppingListItemData,
  ): Promise<BaseShoppingListItem>
  removeItemFromList(itemId: string): Promise<void>
  getItemsByUserId(userId: string): Promise<BaseShoppingListItem[]>
  toggleItemChecked(itemId: string): Promise<BaseShoppingListItem>
  clearCheckedItems(userId: string): Promise<void>
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
