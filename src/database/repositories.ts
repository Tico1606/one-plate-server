import { prisma } from './prisma/prisma-client.ts'
import {
  PrismaCategoryRepository,
  PrismaFavoriteRepository,
  PrismaIngredientRepository,
  PrismaPushSubscriptionRepository,
  PrismaRecipeRepository,
  PrismaReviewRepository,
  PrismaShoppingListRepository,
  PrismaUserRepository,
} from './prisma/repositories/index.ts'

// Instâncias dos repositórios
export const userRepository = new PrismaUserRepository(prisma)
export const recipeRepository = new PrismaRecipeRepository(prisma)
export const categoryRepository = new PrismaCategoryRepository(prisma)
export const favoriteRepository = new PrismaFavoriteRepository(prisma)
export const reviewRepository = new PrismaReviewRepository(prisma)
export const shoppingListRepository = new PrismaShoppingListRepository(prisma)
export const ingredientRepository = new PrismaIngredientRepository(prisma)
export const pushSubscriptionRepository = new PrismaPushSubscriptionRepository()
