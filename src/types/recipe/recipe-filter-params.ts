export type RecipeFilterParams = {
  title?: string
  category?: string
  authorId?: string
  kcalMin?: number
  kcalMax?: number
  timeToPrepare?: string
  portionsMin?: number
  portionsMax?: number
  page: number
}
