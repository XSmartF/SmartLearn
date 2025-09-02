export type FilterOperator =
    | 'eq'        // bằng
    | 'neq'       // khác
    | 'lt'        // nhỏ hơn
    | 'lte'       // nhỏ hơn hoặc bằng
    | 'gt'        // lớn hơn
    | 'gte'       // lớn hơn hoặc bằng
    | 'contains'  // chứa (chuỗi)
    | 'startsWith'// bắt đầu bằng (chuỗi)
    | 'endsWith'  // kết thúc bằng (chuỗi)
    | 'in'        // nằm trong tập giá trị
    | 'between'   // nằm trong khoảng (số, ngày)

export interface FilterCondition<T> {
    field: keyof T
    operator: FilterOperator
    value: unknown
    valueTo?: unknown
}

export type SearchOperator = 'contains' | 'eq' | 'startsWith' | 'endsWith'

export interface SearchCondition<T> {
    field: keyof T
    operator?: SearchOperator
    value: string
}
/** Sort configuration */
export interface SortOption<T> {
    field: keyof T
    order: 'asc' | 'desc'
}

/** Query params gửi lên backend */
export interface PaginationQuery<T> {
    page: number
    pageSize: number
    sort?: SortOption<T>
    /** (Deprecated) Giữ lại nếu backend cũ vẫn nhận */
    filter?: { [key: string]: keyof T }
    filters?: FilterCondition<T>[]
    search?: string
    searchFields?: (keyof T)[]
    searches?: SearchCondition<T>[]
}

/** Kết quả trang từ backend */
export interface PaginatedResult<T> {
    items: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    sort?: SortOption<T>
    filters?: FilterCondition<T>[]
    search?: string
    searchFields?: (keyof T)[]
    searches?: SearchCondition<T>[]
}

/** State client đầy đủ */
export interface PaginationState<T> {
    items: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    loading: boolean
    sort?: SortOption<T>
    filters: FilterCondition<T>[]
    search: string
    searchFields?: (keyof T)[]
    searches: SearchCondition<T>[]
    error?: string
}

export interface PaginationActions<T> {
    setPage: (page: number) => void
    setPageSize: (size: number) => void
    setSort: (sort?: SortOption<T>) => void
    setSearch: (keyword: string) => void
    setSearchFields: (fields?: (keyof T)[]) => void
    setSearches: (conditions: SearchCondition<T>[]) => void
    addFilter: (filter: FilterCondition<T>) => void
    updateFilter: (filter: FilterCondition<T>) => void
    removeFilter: (field: keyof T) => void
    clearFilters: () => void
    reset: () => void
    setLoading: (loading: boolean) => void
    setError: (err?: string) => void
    applyResult: (result: PaginatedResult<T>) => void
}

export type UsePaginationReturn<T> = [PaginationState<T>, PaginationActions<T>]

/** Giá trị khởi tạo linh hoạt */
export interface CreatePaginationStateOptions<T> {
    page?: number
    pageSize?: number
    sort?: SortOption<T>
    search?: string
    searchFields?: (keyof T)[]
    filters?: FilterCondition<T>[]
    searches?: SearchCondition<T>[]
}

export function createInitialPaginationState<T>(opts: CreatePaginationStateOptions<T> = {}): PaginationState<T> {
    return {
        items: [],
        total: 0,
        page: opts.page ?? 1,
        pageSize: opts.pageSize ?? 10,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        loading: false,
        sort: opts.sort,
        filters: opts.filters ?? [],
        search: opts.search ?? '',
        searchFields: opts.searchFields,
        searches: opts.searches ?? [],
        error: undefined,
    }
}

/** Build query object (client -> backend) */
export function buildPaginationQuery<T>(state: PaginationState<T>): PaginationQuery<T> {
    return {
        page: state.page,
        pageSize: state.pageSize,
        sort: state.sort,
        filters: state.filters.length ? state.filters : undefined,
        search: state.search || undefined,
        searchFields: state.searchFields && state.searchFields.length ? state.searchFields : undefined,
        searches: state.searches.length ? state.searches : undefined,
    }
}

/** Merge backend result vào state */
export function applyPaginatedResultToState<T>(state: PaginationState<T>, result: PaginatedResult<T>): PaginationState<T> {
    return {
        ...state,
        items: result.items,
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
        hasNextPage: result.hasNextPage,
        hasPreviousPage: result.hasPreviousPage,
        sort: result.sort ?? state.sort,
        filters: result.filters ?? state.filters,
        search: result.search ?? state.search,
        searchFields: result.searchFields ?? state.searchFields,
        searches: result.searches ?? state.searches,
        loading: false,
        error: undefined,
    }
}
