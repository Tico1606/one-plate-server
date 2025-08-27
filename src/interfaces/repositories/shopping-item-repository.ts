import type {
  ShoppingItemCreateParams,
  ShoppingItemFilterParams,
  ShoppingItemUpdateParams,
} from '../../types/shoppingItem/index.ts'

export interface IShoppingItemRepository {
  findById(itemId: string): Promise<any | null>
  findMany(params: ShoppingItemFilterParams): Promise<any[]>
  create(data: ShoppingItemCreateParams): Promise<any>
  update(data: ShoppingItemUpdateParams, itemId: string): Promise<any>
  delete(itemId: string): Promise<void>
}
