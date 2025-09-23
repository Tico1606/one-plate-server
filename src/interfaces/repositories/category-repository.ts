export interface BaseCategory {
  id: string
  name: string
}

export interface CategoryWithRelations extends BaseCategory {
  _count: {
    recipes: number
  }
}

export interface CategoryRepository {
  findById(id: string): Promise<BaseCategory | null>
  findByName(name: string): Promise<BaseCategory | null>
  create(data: CreateCategoryData): Promise<BaseCategory>
  update(id: string, data: UpdateCategoryData): Promise<BaseCategory>
  delete(id: string): Promise<void>
  list(
    params: ListCategoriesParams,
  ): Promise<{ categories: BaseCategory[]; total: number }>
  listWithRelations(
    params: ListCategoriesParams,
  ): Promise<{ categories: CategoryWithRelations[]; total: number }>
}

export interface CreateCategoryData {
  name: string
}

export interface UpdateCategoryData {
  name?: string
}

export interface ListCategoriesParams {
  page: number
  limit: number
  search?: string
}
