import { NotFoundError } from '@/errors/not-found-error.ts'
import type { ShoppingListRepository } from '@/interfaces/repositories/shopping-list-repository.ts'

export interface GetShoppingListByUserIdRequest {
  userId: string
}

export interface GetShoppingListByUserIdResponse {
  shoppingList: {
    id: string
    userId: string
    title: string
    createdAt: Date
    updatedAt: Date
    items: Array<{
      id: string
      listId: string
      ingredientId?: string | null
      recipeId?: string | null
      customText?: string | null
      amount?: number | null
      unit?: string | null
      isChecked: boolean
      createdAt: Date
      updatedAt: Date
      ingredient?: {
        id: string
        name: string
        description?: string | null
        imageUrl?: string | null
      } | null
      recipe?: {
        id: string
        title: string
        description?: string | null
        imageUrl?: string | null
      } | null
    }>
  }
}

export class GetShoppingListByUserIdUseCase {
  constructor(private shoppingListRepository: ShoppingListRepository) {}

  async execute(
    request: GetShoppingListByUserIdRequest,
  ): Promise<GetShoppingListByUserIdResponse> {
    const shoppingList = await this.shoppingListRepository.findByUserIdWithRelations(
      request.userId,
    )

    // A lista sempre existirá agora (criada automaticamente se não existir)
    if (!shoppingList) {
      throw new NotFoundError('Erro ao criar lista de compras')
    }

    return {
      shoppingList: {
        id: shoppingList.id,
        userId: shoppingList.userId,
        title: shoppingList.title,
        createdAt: shoppingList.createdAt,
        updatedAt: shoppingList.updatedAt,
        items: shoppingList.items.map((item) => {
          const imageUrl =
            item.recipe?.photos && item.recipe.photos.length > 0
              ? item.recipe.photos[0]?.url || null
              : null

          return {
            id: item.id,
            listId: item.listId,
            ingredientId: item.ingredientId,
            recipeId: item.recipeId,
            customText: item.customText,
            amount: item.amount,
            unit: item.unit,
            isChecked: item.isChecked,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            ingredient: item.ingredient
              ? {
                  id: item.ingredient.id,
                  name: item.ingredient.name,
                  description: item.ingredient.description,
                  imageUrl: item.ingredient.imageUrl,
                }
              : null,
            recipe: item.recipe
              ? {
                  id: item.recipe.id,
                  title: item.recipe.title,
                  description: item.recipe.description,
                  imageUrl,
                }
              : null,
          }
        }),
      },
    }
  }
}
