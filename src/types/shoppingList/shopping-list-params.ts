export interface ShoppingListCreateParams {
  userId: string
  title?: string
}

export interface ShoppingListUpdateParams {
  title?: string
}

export interface ShoppingListItemCreateParams {
  ingredientId?: string
  recipeId?: string
  customText?: string
  amount?: number
  unit?: string
  isChecked?: boolean
}

export interface ShoppingListItemUpdateParams {
  customText?: string
  amount?: number
  unit?: string
  isChecked?: boolean
}
