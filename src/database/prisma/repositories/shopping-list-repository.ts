import type {
  CreateShoppingListData,
  CreateShoppingListItemData,
  ListShoppingListsParams,
  ShoppingListRepository,
  UpdateShoppingListData,
  UpdateShoppingListItemData,
} from '@/interfaces/repositories/shopping-list-repository.ts'
import type {
  BaseShoppingList,
  BaseShoppingListItem,
  ShoppingListWithRelations,
} from '@/types/base/index.ts'
import type { PrismaClient } from '@prisma/client'
import { PrismaRepository } from './prisma-repository.ts'

export class PrismaShoppingListRepository
  extends PrismaRepository
  implements ShoppingListRepository
{
  async findById(id: string): Promise<BaseShoppingList | null> {
    const list = await this.prisma.shoppingList.findUnique({
      where: { id },
    })

    return list
  }

  async findByIdWithRelations(id: string): Promise<ShoppingListWithRelations | null> {
    const list = await this.prisma.shoppingList.findUnique({
      where: { id },
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

    return list as ShoppingListWithRelations | null
  }

  async findByUserId(
    userId: string,
    params: ListShoppingListsParams,
  ): Promise<{ lists: BaseShoppingList[]; total: number }> {
    const { page, limit } = params
    const skip = (page - 1) * limit

    const [lists, total] = await Promise.all([
      this.prisma.shoppingList.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.shoppingList.count({ where: { userId } }),
    ])

    return { lists, total }
  }

  async findByUserIdWithRelations(
    userId: string,
    params: ListShoppingListsParams,
  ): Promise<{ lists: ShoppingListWithRelations[]; total: number }> {
    const { page, limit } = params
    const skip = (page - 1) * limit

    const [lists, total] = await Promise.all([
      this.prisma.shoppingList.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
      }),
      this.prisma.shoppingList.count({ where: { userId } }),
    ])

    return { lists: lists as ShoppingListWithRelations[], total }
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

  async update(id: string, data: UpdateShoppingListData): Promise<BaseShoppingList> {
    const list = await this.prisma.shoppingList.update({
      where: { id },
      data: {
        title: data.title,
      },
    })

    return list
  }

  async delete(id: string): Promise<void> {
    await this.prisma.shoppingList.delete({
      where: { id },
    })
  }

  async addItemToList(
    listId: string,
    itemData: CreateShoppingListItemData,
  ): Promise<BaseShoppingListItem> {
    const item = await this.prisma.shoppingListItem.create({
      data: {
        listId,
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

  async getItemsByList(listId: string): Promise<BaseShoppingListItem[]> {
    const items = await this.prisma.shoppingListItem.findMany({
      where: { listId },
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

  async clearCheckedItems(listId: string): Promise<void> {
    await this.prisma.shoppingListItem.deleteMany({
      where: {
        listId,
        isChecked: true,
      },
    })
  }
}
