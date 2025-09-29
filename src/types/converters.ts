// Funções utilitárias para converter modelos de domínio para DTOs
import type {
  BaseCategory,
  BaseFavorite,
  BaseIngredient,
  BaseRecipePhoto,
  BaseRecipeView,
  BaseReview,
  BaseStep,
  BaseUser,
  RecipeWithRelations,
  ReviewWithRelations,
  ShoppingListWithRelations,
} from './base/index.ts'
import type {
  CategoryDTO,
  FavoriteDTO,
  IngredientDTO,
  RecipeCategoryDTO,
  RecipeDTO,
  RecipeIngredientDTO,
  RecipeListItemDTO,
  RecipePhotoDTO,
  RecipeStepDTO,
  RecipeViewDTO,
  ReviewDTO,
  ReviewListItemDTO,
  ShoppingListDTO,
  UserDTO,
} from './dtos.ts'

// ============================================================================
// Conversores para DTOs base
// ============================================================================

export function toUserDTO(user: BaseUser): UserDTO {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    photoUrl: user.photoUrl,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

export function toRecipePhotoDTO(photo: BaseRecipePhoto): RecipePhotoDTO {
  return {
    id: photo.id,
    recipeId: photo.recipeId,
    url: photo.url,
    order: photo.order,
  }
}

export function toRecipeStepDTO(step: BaseStep): RecipeStepDTO {
  return {
    id: step.id,
    recipeId: step.recipeId,
    order: step.order,
    description: step.description,
    durationSec: step.durationSec,
  }
}

export function toCategoryDTO(category: BaseCategory): CategoryDTO {
  return {
    id: category.id,
    name: category.name,
  }
}

export function toIngredientDTO(ingredient: BaseIngredient): IngredientDTO {
  return {
    id: ingredient.id,
    name: ingredient.name,
    description: ingredient.description,
    imageUrl: ingredient.imageUrl,
  }
}

export function toRecipeViewDTO(view: BaseRecipeView): RecipeViewDTO {
  return {
    id: view.id,
    userId: view.userId,
    recipeId: view.recipeId,
    createdAt: view.createdAt,
  }
}

// ============================================================================
// Conversores para DTOs com relacionamentos
// ============================================================================

export function toRecipeCategoryDTO(categoryRelation: {
  category: BaseCategory
}): RecipeCategoryDTO {
  return {
    id: categoryRelation.category?.id || '',
    name: categoryRelation.category?.name || '',
  }
}

export function toRecipeIngredientDTO(ingredientRelation: {
  ingredient: BaseIngredient
  amount?: number | null
  unit?: string | null
}): RecipeIngredientDTO {
  return {
    id: ingredientRelation.ingredient?.id || '',
    name: ingredientRelation.ingredient?.name || '',
    amount: ingredientRelation.amount,
    unit: ingredientRelation.unit,
  }
}

export function toReviewDTO(
  review: BaseReview,
  user?: BaseUser,
  recipe?: RecipeDTO,
): ReviewDTO {
  return {
    id: review.id,
    recipeId: review.recipeId,
    userId: review.userId,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    user: user ? toUserDTO(user) : ({} as UserDTO), // Fallback temporário
    recipe,
  }
}

export function toFavoriteDTO(
  favorite: BaseFavorite,
  recipe?: RecipeDTO,
  user?: BaseUser,
): FavoriteDTO {
  return {
    userId: favorite.userId,
    recipeId: favorite.recipeId,
    createdAt: favorite.createdAt,
    recipe: recipe || ({} as RecipeDTO), // Fallback temporário
    user: user ? toUserDTO(user) : ({} as UserDTO), // Fallback temporário
  }
}

// ============================================================================
// Conversores principais
// ============================================================================

export function toRecipeDTO(
  recipe: RecipeWithRelations,
  includeFullRelations = true,
): RecipeDTO {
  const baseRecipe: RecipeDTO = {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    difficulty: recipe.difficulty,
    prepTime: recipe.prepTime,
    servings: recipe.servings,
    videoUrl: recipe.videoUrl,
    source: recipe.source,
    calories: recipe.calories,
    proteinGrams: recipe.proteinGrams,
    carbGrams: recipe.carbGrams,
    fatGrams: recipe.fatGrams,
    status: recipe.status,
    publishedAt: recipe.publishedAt,
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
    // Campos calculados
    averageRating: (recipe as any).averageRating || 0,
    totalReviews: recipe._count?.reviews || 0,
    totalFavorites: recipe._count?.favorites || 0,
    totalViews: recipe._count?.views || 0,
    image:
      recipe.photos && recipe.photos.length > 0
        ? recipe.photos[0].url
        : '/placeholder-recipe.jpg',
    // Relacionamentos
    author: toUserDTO(recipe.author),
    photos: recipe.photos?.map(toRecipePhotoDTO) || [],
    steps: recipe.steps?.map(toRecipeStepDTO) || [],
    categories: recipe.categories?.map(toRecipeCategoryDTO) || [],
    ingredients: recipe.ingredients?.map(toRecipeIngredientDTO) || [],
    reviews: includeFullRelations
      ? recipe.reviews?.map((r) => toReviewDTO(r, (r as any).user)) || []
      : [],
    favorites: includeFullRelations
      ? recipe.favorites?.map((f) => toFavoriteDTO(f)) || []
      : [],
    views: recipe.views?.map(toRecipeViewDTO) || [],
  }

  return baseRecipe
}

export function toRecipeListItemDTO(recipe: RecipeWithRelations): RecipeListItemDTO {
  return {
    id: recipe.id,
    title: recipe.title,
    description: recipe.description,
    difficulty: recipe.difficulty,
    prepTime: recipe.prepTime,
    servings: recipe.servings,
    calories: recipe.calories,
    status: recipe.status,
    publishedAt: recipe.publishedAt,
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
    // Campos calculados
    averageRating: (recipe as any).averageRating || 0,
    totalReviews: recipe._count?.reviews || 0,
    totalFavorites: recipe._count?.favorites || 0,
    totalViews: recipe._count?.views || 0,
    image:
      recipe.photos && recipe.photos.length > 0
        ? recipe.photos[0].url
        : '/placeholder-recipe.jpg',
    // Relacionamentos mínimos
    author: toUserDTO(recipe.author),
    photos: recipe.photos?.map(toRecipePhotoDTO) || [],
    categories: recipe.categories?.map(toRecipeCategoryDTO) || [],
    ingredients: recipe.ingredients?.map(toRecipeIngredientDTO) || [],
  }
}

export function toReviewListItemDTO(review: ReviewWithRelations): ReviewListItemDTO {
  return {
    id: review.id,
    recipeId: review.recipeId,
    userId: review.userId,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
    user: toUserDTO(review.user),
  }
}

export function toShoppingListDTO(
  shoppingList: ShoppingListWithRelations,
): ShoppingListDTO {
  return {
    id: shoppingList.id,
    userId: shoppingList.userId,
    title: shoppingList.title,
    createdAt: shoppingList.createdAt,
    updatedAt: shoppingList.updatedAt,
    user: toUserDTO(shoppingList.user),
    items: shoppingList.items.map((item) => ({
      id: item.id,
      listId: shoppingList.id, // Usar o ID da lista pai
      ingredientId: item.ingredientId,
      recipeId: item.recipeId,
      customText: item.customText,
      amount: item.amount,
      unit: item.unit,
      isChecked: item.isChecked,
      ingredient: item.ingredient ? toIngredientDTO(item.ingredient) : null,
      recipe: item.recipe ? toRecipeDTO(item.recipe as RecipeWithRelations, false) : null,
    })),
  }
}

// ============================================================================
// Conversores para listas
// ============================================================================

export function toRecipeListDTO(recipes: RecipeWithRelations[]): RecipeListItemDTO[] {
  return recipes.map(toRecipeListItemDTO)
}

export function toReviewListDTO(reviews: ReviewWithRelations[]): ReviewListItemDTO[] {
  return reviews.map(toReviewListItemDTO)
}

export function toShoppingListListDTO(
  shoppingLists: ShoppingListWithRelations[],
): ShoppingListDTO[] {
  return shoppingLists.map(toShoppingListDTO)
}
