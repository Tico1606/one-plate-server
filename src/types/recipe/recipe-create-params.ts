export type RecipeCreateParams = {
  title: string
  category: string
  description?: string
  kcal?: number
  timeToPrepare: string
  portions: number
  steps: string[]
  authorId: string
}
