import type {
  CreateCategoryData,
  ListCategoriesParams,
  UpdateCategoryData,
} from '@/interfaces/repositories/category-repository.ts'

export interface CategoryCreateParams extends CreateCategoryData {}
export interface CategoryUpdateParams extends UpdateCategoryData {}
export interface CategoryFilterParams extends ListCategoriesParams {}
