import { NotFoundError } from '@/errors/not-found-error.ts'
import type { ShoppingListRepository } from '@/interfaces/repositories/shopping-list-repository.ts'

export interface ClearCheckedItemsRequest {
  userId: string
}

export class ClearCheckedItemsUseCase {
  constructor(private shoppingListRepository: ShoppingListRepository) {}

  async execute(request: ClearCheckedItemsRequest): Promise<void> {
    // Verificar se a lista existe
    const existingList = await this.shoppingListRepository.findByUserId(request.userId)
    if (!existingList) {
      throw new NotFoundError('Lista de compras não encontrada')
    }

    await this.shoppingListRepository.clearCheckedItems(request.userId)
  }
}
