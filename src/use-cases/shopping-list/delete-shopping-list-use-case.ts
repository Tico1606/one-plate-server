import type { ShoppingListRepository } from '@/interfaces/repositories/shopping-list-repository.ts'

export interface DeleteShoppingListRequest {
  userId: string
}

export class DeleteShoppingListUseCase {
  constructor(private shoppingListRepository: ShoppingListRepository) {}

  async execute(request: DeleteShoppingListRequest): Promise<void> {
    // Verificar se a lista existe
    const existingList = await this.shoppingListRepository.findByUserId(request.userId)
    if (!existingList) {
      // Se não existe, não há nada para deletar
      return
    }

    await this.shoppingListRepository.delete(request.userId)
  }
}
