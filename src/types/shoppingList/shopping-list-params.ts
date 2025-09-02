import type {
  CreateShoppingListData,
  CreateShoppingListItemData,
  ListShoppingListsParams,
  UpdateShoppingListData,
  UpdateShoppingListItemData,
} from '@/interfaces/repositories/shopping-list-repository.ts'

export interface ShoppingListCreateParams extends CreateShoppingListData {}
export interface ShoppingListUpdateParams extends UpdateShoppingListData {}
export interface ShoppingListItemCreateParams extends CreateShoppingListItemData {}
export interface ShoppingListItemUpdateParams extends UpdateShoppingListItemData {}
export interface ShoppingListFilterParams extends ListShoppingListsParams {}
