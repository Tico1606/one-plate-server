import type {
  CreateShoppingListData,
  CreateShoppingListItemData,
  ShoppingListRepository,
  UpdateShoppingListData,
  UpdateShoppingListItemData,
} from '@/interfaces/repositories/shopping-list-repository.ts'
import type {
  BaseShoppingList,
  BaseShoppingListItem,
  ShoppingListWithRelations,
} from '@/types/base/index.ts'
import { PrismaRepository } from './prisma-repository.ts'

export class PrismaShoppingListRepository
  extends PrismaRepository
  implements ShoppingListRepository
{
  async findByUserId(userId: string): Promise<BaseShoppingList | null> {
    let list = await this.prisma.shoppingList.findUnique({
      where: { userId },
    })

    // Se não existe lista, criar uma automaticamente
    if (!list) {
      list = await this.create({ userId })
    }

    return list
  }

  async findByUserIdWithRelations(
    userId: string,
  ): Promise<ShoppingListWithRelations | null> {
    let list = await this.prisma.shoppingList.findUnique({
      where: { userId },
      include: {
        user: true,
        items: {
          include: {
            ingredient: true,
            recipe: true,
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    // Se não existe lista, criar uma automaticamente
    if (!list) {
      await this.create({ userId })
      // Buscar novamente com relations
      list = await this.prisma.shoppingList.findUnique({
        where: { userId },
        include: {
          user: true,
          items: {
            include: {
              ingredient: true,
              recipe: true,
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      })
    }

    return list as ShoppingListWithRelations | null
  }

  async create(data: CreateShoppingListData): Promise<BaseShoppingList> {
    const list = await this.prisma.shoppingList.create({
      data: {
        userId: data.userId,
        title: data.title || 'Minha Lista de Compras',
      },
    })

    return list
  }

  async update(userId: string, data: UpdateShoppingListData): Promise<BaseShoppingList> {
    const list = await this.prisma.shoppingList.update({
      where: { userId },
      data: {
        title: data.title,
      },
    })

    return list
  }

  async delete(userId: string): Promise<void> {
    await this.prisma.shoppingList.delete({
      where: { userId },
    })
  }

  async addItemToList(
    userId: string,
    itemData: CreateShoppingListItemData,
  ): Promise<BaseShoppingListItem> {
    // Primeiro, encontrar ou criar a lista do usuário
    let list = await this.findByUserId(userId)
    if (!list) {
      list = await this.create({ userId })
    }

    const item = await this.prisma.shoppingListItem.create({
      data: {
        listId: list.id,
        ingredientId: itemData.ingredientId,
        recipeId: itemData.recipeId,
        customText: itemData.customText,
        amount: itemData.amount,
        unit: itemData.unit,
      },
    })

    return item
  }

  async updateItemInList(
    itemId: string,
    itemData: UpdateShoppingListItemData,
  ): Promise<BaseShoppingListItem> {
    const item = await this.prisma.shoppingListItem.update({
      where: { id: itemId },
      data: {
        ingredientId: itemData.ingredientId,
        recipeId: itemData.recipeId,
        customText: itemData.customText,
        amount: itemData.amount,
        unit: itemData.unit,
        isChecked: itemData.isChecked,
      },
    })

    return item
  }

  async removeItemFromList(itemId: string): Promise<void> {
    await this.prisma.shoppingListItem.delete({
      where: { id: itemId },
    })
  }

  async getItemsByUserId(userId: string): Promise<BaseShoppingListItem[]> {
    const list = await this.findByUserId(userId)
    if (!list) {
      return []
    }

    const items = await this.prisma.shoppingListItem.findMany({
      where: { listId: list.id },
      include: {
        ingredient: true,
        recipe: true,
      },
      orderBy: { createdAt: 'asc' },
    })

    return items
  }

  async toggleItemChecked(itemId: string): Promise<BaseShoppingListItem> {
    const item = await this.prisma.shoppingListItem.findUnique({
      where: { id: itemId },
    })

    if (!item) {
      throw new Error('Item não encontrado')
    }

    const updatedItem = await this.prisma.shoppingListItem.update({
      where: { id: itemId },
      data: {
        isChecked: !item.isChecked,
      },
    })

    return updatedItem
  }

  async clearCheckedItems(userId: string): Promise<void> {
    const list = await this.findByUserId(userId)
    if (!list) {
      return
    }

    await this.prisma.shoppingListItem.deleteMany({
      where: {
        listId: list.id,
        isChecked: true,
      },
    })
  }
}
