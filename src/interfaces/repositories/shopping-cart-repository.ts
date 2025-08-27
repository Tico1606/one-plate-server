import type {
  ShoppingCartCreateParams,
  ShoppingCartFilterParams,
} from '../../types/shoppingCart/index.ts'

export interface IShoppingCartRepository {
  findById(cartId: string): Promise<any | null>
  findByUserId(userId: string): Promise<any | null>
  findMany(params: ShoppingCartFilterParams): Promise<any[]>
  create(data: ShoppingCartCreateParams): Promise<any>
  update(data: any, cartId: string): Promise<any>
  delete(cartId: string): Promise<void>
}
