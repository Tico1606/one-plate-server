import { NotFoundError } from '@/errors/not-found-error.ts'
import type { ShoppingListRepository } from '@/interfaces/repositories/shopping-list-repository.ts'

export interface RemoveItemFromShoppingListRequest {
  itemId: string
}

export class RemoveItemFromShoppingListUseCase {
  constructor(private shoppingListRepository: ShoppingListRepository) {}

  async execute(request: RemoveItemFromShoppingListRequest): Promise<void> {
    try {
      await this.shoppingListRepository.removeItemFromList(request.itemId)
    } catch {
      throw new NotFoundError('Item da lista não encontrado')
    }
  }
}
