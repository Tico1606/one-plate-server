import { ValidationError } from '@/errors/validation-error.ts'
import type {
  CreateShoppingListData,
  ShoppingListRepository,
} from '@/interfaces/repositories/shopping-list-repository.ts'

export interface CreateShoppingListRequest extends CreateShoppingListData {}

export interface CreateShoppingListResponse {
  shoppingList: {
    id: string
    userId: string
    title: string
    createdAt: Date
    updatedAt: Date
  }
}

export class CreateShoppingListUseCase {
  constructor(private shoppingListRepository: ShoppingListRepository) {}

  async execute(request: CreateShoppingListRequest): Promise<CreateShoppingListResponse> {
    // Validar se o userId não está vazio
    if (!request.userId || request.userId.trim().length === 0) {
      throw new ValidationError('ID do usuário é obrigatório')
    }

    // Verificar se já existe uma lista para o usuário
    const existingList = await this.shoppingListRepository.findByUserId(request.userId)
    if (existingList) {
      throw new ValidationError('Usuário já possui uma lista de compras')
    }

    const shoppingList = await this.shoppingListRepository.create({
      userId: request.userId,
      title: request.title || 'Minha Lista de Compras',
    })

    return {
      shoppingList: {
        id: shoppingList.id,
        userId: shoppingList.userId,
        title: shoppingList.title,
        createdAt: shoppingList.createdAt,
        updatedAt: shoppingList.updatedAt,
      },
    }
  }
}
