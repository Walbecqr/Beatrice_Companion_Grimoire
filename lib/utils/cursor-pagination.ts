import { Correspondence } from '@/types/correspondence'

// Base interface for cursor pagination
interface CursorPaginationParams {
  limit?: number
  cursor?: string
  direction?: 'forward' | 'backward'
}

interface PaginatedResult<T> {
  items: T[]
  pagination: {
    hasNextPage: boolean
    hasPreviousPage: boolean
    startCursor: string | null
    endCursor: string | null
    totalCount?: number
  }
  cursors: {
    before: string | null
    after: string | null
  }
}

interface SortConfig {
  field: keyof Correspondence
  direction: 'asc' | 'desc'
}

/**
 * Cursor-based pagination utility for correspondences
 * Provides efficient pagination for large datasets
 */
export class CursorPagination<T extends { id: string; created_at: string; updated_at: string }> {
  private data: T[]
  private sortConfig: SortConfig
  private defaultLimit: number

  constructor(
    data: T[],
    sortConfig: SortConfig = { field: 'created_at', direction: 'desc' },
    defaultLimit: number = 20
  ) {
    this.data = [...data] // Create a copy to avoid mutations
    this.sortConfig = sortConfig
    this.defaultLimit = defaultLimit
    this.sortData()
  }

  /**
   * Sort data according to configuration
   */
  private sortData(): void {
    this.data.sort((a, b) => {
      const field = this.sortConfig.field
      const direction = this.sortConfig.direction
      
      let aValue = a[field]
      let bValue = b[field]
      
      // Handle different data types
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        // For dates, convert to timestamp
        if (field === 'created_at' || field === 'updated_at') {
          aValue = new Date(aValue).getTime() as any
          bValue = new Date(bValue).getTime() as any
        } else {
          // String comparison
          return direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }
      }
      
      // Numeric comparison
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return direction === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      // Fallback to string comparison
      return direction === 'asc' 
        ? String(aValue).localeCompare(String(bValue))
        : String(bValue).localeCompare(String(aValue))
    })
  }

  /**
   * Get paginated results using cursor
   */
  paginate(params: CursorPaginationParams = {}): PaginatedResult<T> {
    const {
      limit = this.defaultLimit,
      cursor,
      direction = 'forward'
    } = params

    let startIndex = 0
    let endIndex = this.data.length

    // Find cursor position
    if (cursor) {
      const cursorIndex = this.findCursorIndex(cursor)
      
      if (cursorIndex !== -1) {
        if (direction === 'forward') {
          startIndex = cursorIndex + 1
        } else {
          endIndex = cursorIndex
          startIndex = Math.max(0, endIndex - limit)
        }
      }
    }

    // Apply pagination
    if (direction === 'forward') {
      endIndex = Math.min(startIndex + limit, this.data.length)
    }

    const items = this.data.slice(startIndex, endIndex)

    // Calculate pagination info
    const hasNextPage = direction === 'forward' 
      ? endIndex < this.data.length
      : startIndex > 0

    const hasPreviousPage = direction === 'forward'
      ? startIndex > 0
      : endIndex < this.data.length

    const startCursor = items.length > 0 ? this.createCursor(items[0]) : null
    const endCursor = items.length > 0 ? this.createCursor(items[items.length - 1]) : null

    return {
      items,
      pagination: {
        hasNextPage,
        hasPreviousPage,
        startCursor,
        endCursor,
        totalCount: this.data.length
      },
      cursors: {
        before: startCursor,
        after: endCursor
      }
    }
  }

  /**
   * Get next page
   */
  getNextPage(currentEndCursor: string, limit?: number): PaginatedResult<T> {
    return this.paginate({
      cursor: currentEndCursor,
      direction: 'forward',
      limit
    })
  }

  /**
   * Get previous page
   */
  getPreviousPage(currentStartCursor: string, limit?: number): PaginatedResult<T> {
    return this.paginate({
      cursor: currentStartCursor,
      direction: 'backward',
      limit
    })
  }

  /**
   * Get first page
   */
  getFirstPage(limit?: number): PaginatedResult<T> {
    return this.paginate({
      direction: 'forward',
      limit
    })
  }

  /**
   * Get page around a specific item
   */
  getPageAround(itemId: string, limit?: number): PaginatedResult<T> {
    const itemIndex = this.data.findIndex(item => item.id === itemId)
    
    if (itemIndex === -1) {
      return this.getFirstPage(limit)
    }

    const pageLimit = limit || this.defaultLimit
    const halfLimit = Math.floor(pageLimit / 2)
    
    let startIndex = Math.max(0, itemIndex - halfLimit)
    let endIndex = Math.min(this.data.length, startIndex + pageLimit)
    
    // Adjust if we're near the end
    if (endIndex - startIndex < pageLimit && startIndex > 0) {
      startIndex = Math.max(0, endIndex - pageLimit)
    }

    const items = this.data.slice(startIndex, endIndex)

    return {
      items,
      pagination: {
        hasNextPage: endIndex < this.data.length,
        hasPreviousPage: startIndex > 0,
        startCursor: items.length > 0 ? this.createCursor(items[0]) : null,
        endCursor: items.length > 0 ? this.createCursor(items[items.length - 1]) : null,
        totalCount: this.data.length
      },
      cursors: {
        before: items.length > 0 ? this.createCursor(items[0]) : null,
        after: items.length > 0 ? this.createCursor(items[items.length - 1]) : null
      }
    }
  }

  /**
   * Create cursor from item
   */
  private createCursor(item: T): string {
    const sortField = this.sortConfig.field
    const sortValue = item[sortField]
    
    // Create cursor with sort value and ID for uniqueness
    const cursorData = {
      value: sortValue,
      id: item.id,
      field: sortField
    }
    
    return btoa(JSON.stringify(cursorData))
  }

  /**
   * Parse cursor and find index
   */
  private findCursorIndex(cursor: string): number {
    try {
      const cursorData = JSON.parse(atob(cursor))
      
      return this.data.findIndex(item => 
        item.id === cursorData.id && 
        item[cursorData.field] === cursorData.value
      )
    } catch {
      return -1
    }
  }

  /**
   * Update sort configuration and re-sort
   */
  updateSort(sortConfig: SortConfig): void {
    this.sortConfig = sortConfig
    this.sortData()
  }

  /**
   * Update data and re-sort
   */
  updateData(newData: T[]): void {
    this.data = [...newData]
    this.sortData()
  }

  /**
   * Get total count
   */
  getTotalCount(): number {
    return this.data.length
  }

  /**
   * Get current sort configuration
   */
  getSortConfig(): SortConfig {
    return { ...this.sortConfig }
  }
}

/**
 * Utility function to create cursor pagination for correspondences
 */
export function createCorrespondencePagination(
  correspondences: Correspondence[],
  sortBy: keyof Correspondence = 'created_at',
  sortDirection: 'asc' | 'desc' = 'desc',
  defaultLimit: number = 20
): CursorPagination<Correspondence> {
  return new CursorPagination(
    correspondences,
    { field: sortBy, direction: sortDirection },
    defaultLimit
  )
}

/**
 * Hook for managing cursor pagination state in React components
 */
export interface UseCursorPaginationParams<T> {
  data: T[]
  sortConfig?: SortConfig
  defaultLimit?: number
}

export interface UseCursorPaginationReturn<T> {
  currentPage: PaginatedResult<T>
  goToNextPage: () => void
  goToPreviousPage: () => void
  goToFirstPage: () => void
  goToPageAround: (itemId: string) => void
  updateSort: (sortConfig: SortConfig) => void
  updateData: (newData: T[]) => void
  pagination: CursorPagination<T>
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

/**
 * React hook for cursor pagination
 */
export function useCursorPagination<T extends { id: string; created_at: string; updated_at: string }>(
  params: UseCursorPaginationParams<T>
): UseCursorPaginationReturn<T> {
  const { 
    data, 
    sortConfig = { field: 'created_at', direction: 'desc' },
    defaultLimit = 20 
  } = params

  const [paginationInstance, setPaginationInstance] = useState<CursorPagination<T>>(
    () => new CursorPagination(data, sortConfig, defaultLimit)
  )
  
  const [currentPage, setCurrentPage] = useState<PaginatedResult<T>>(
    () => paginationInstance.getFirstPage()
  )
  
  const [isLoading, setIsLoading] = useState(false)

  // Update pagination when data changes
  useEffect(() => {
    const newPagination = new CursorPagination(data, sortConfig, defaultLimit)
    setPaginationInstance(newPagination)
    setCurrentPage(newPagination.getFirstPage())
  }, [data, sortConfig, defaultLimit])

  const goToNextPage = useCallback(() => {
    if (currentPage.pagination.hasNextPage && currentPage.pagination.endCursor) {
      const nextPage = paginationInstance.getNextPage(currentPage.pagination.endCursor)
      setCurrentPage(nextPage)
    }
  }, [currentPage, paginationInstance])

  const goToPreviousPage = useCallback(() => {
    if (currentPage.pagination.hasPreviousPage && currentPage.pagination.startCursor) {
      const prevPage = paginationInstance.getPreviousPage(currentPage.pagination.startCursor)
      setCurrentPage(prevPage)
    }
  }, [currentPage, paginationInstance])

  const goToFirstPage = useCallback(() => {
    const firstPage = paginationInstance.getFirstPage()
    setCurrentPage(firstPage)
  }, [paginationInstance])

  const goToPageAround = useCallback((itemId: string) => {
    const page = paginationInstance.getPageAround(itemId)
    setCurrentPage(page)
  }, [paginationInstance])

  const updateSort = useCallback((newSortConfig: SortConfig) => {
    paginationInstance.updateSort(newSortConfig)
    setCurrentPage(paginationInstance.getFirstPage())
  }, [paginationInstance])

  const updateData = useCallback((newData: T[]) => {
    paginationInstance.updateData(newData)
    setCurrentPage(paginationInstance.getFirstPage())
  }, [paginationInstance])

  return {
    currentPage,
    goToNextPage,
    goToPreviousPage,
    goToFirstPage,
    goToPageAround,
    updateSort,
    updateData,
    pagination: paginationInstance,
    isLoading,
    setIsLoading
  }
}

// Import statements for React hooks
import { useState, useEffect, useCallback } from 'react'