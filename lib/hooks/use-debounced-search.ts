import { useState, useEffect, useCallback, useRef } from 'react'

interface UseSearchOptions {
  delay?: number
  minLength?: number
  immediate?: boolean
}

interface SearchState<T> {
  query: string
  results: T[]
  isLoading: boolean
  error: string | null
  hasSearched: boolean
}

/**
 * Custom hook for debounced search with loading states
 */
export function useDebouncedSearch<T>(
  searchFunction: (query: string) => Promise<T[]> | T[],
  options: UseSearchOptions = {}
) {
  const {
    delay = 300,
    minLength = 2,
    immediate = false
  } = options

  const [state, setState] = useState<SearchState<T>>({
    query: '',
    results: [],
    isLoading: false,
    error: null,
    hasSearched: false
  })

  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const abortControllerRef = useRef<AbortController>()
  const lastQueryRef = useRef<string>('')

  // Debounced search function
  const debouncedSearch = useCallback(
    async (query: string) => {
      // Cancel previous search
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Reset state for new search
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null
      }))

      try {
        // Create new abort controller
        abortControllerRef.current = new AbortController()
        
        // Perform search
        const results = await searchFunction(query)
        
        // Check if this is still the current query
        if (lastQueryRef.current === query) {
          setState(prev => ({
            ...prev,
            results: Array.isArray(results) ? results : [],
            isLoading: false,
            hasSearched: true
          }))
        }
      } catch (error: any) {
        // Only set error if not aborted
        if (!abortControllerRef.current?.signal.aborted && lastQueryRef.current === query) {
          setState(prev => ({
            ...prev,
            results: [],
            isLoading: false,
            error: error.message || 'Search failed',
            hasSearched: true
          }))
        }
      }
    },
    [searchFunction]
  )

  // Handle query changes
  const setQuery = useCallback(
    (newQuery: string) => {
      setState(prev => ({ ...prev, query: newQuery }))
      lastQueryRef.current = newQuery

      // Clear previous timeout
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }

      // Handle empty query
      if (!newQuery.trim()) {
        setState(prev => ({
          ...prev,
          results: [],
          isLoading: false,
          error: null,
          hasSearched: false
        }))
        return
      }

      // Handle query too short
      if (newQuery.length < minLength) {
        setState(prev => ({
          ...prev,
          results: [],
          isLoading: false,
          error: null,
          hasSearched: false
        }))
        return
      }

      // Immediate search or debounced
      if (immediate) {
        debouncedSearch(newQuery)
      } else {
        searchTimeoutRef.current = setTimeout(() => {
          debouncedSearch(newQuery)
        }, delay)
      }
    },
    [debouncedSearch, delay, minLength, immediate]
  )

  // Clear search
  const clearSearch = useCallback(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    
    setState({
      query: '',
      results: [],
      isLoading: false,
      error: null,
      hasSearched: false
    })
    lastQueryRef.current = ''
  }, [])

  // Retry search
  const retry = useCallback(() => {
    if (state.query && state.query.length >= minLength) {
      debouncedSearch(state.query)
    }
  }, [state.query, debouncedSearch, minLength])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    ...state,
    setQuery,
    clearSearch,
    retry,
    isMinLength: state.query.length >= minLength
  }
}

/**
 * Specialized hook for correspondence search
 */
export function useCorrespondenceSearch(
  searchFunction: (query: string) => Promise<any[]> | any[],
  options: UseSearchOptions = {}
) {
  return useDebouncedSearch(searchFunction, {
    delay: 250, // Slightly faster for correspondence search
    minLength: 2,
    ...options
  })
}

/**
 * Hook for search suggestions with faster debouncing
 */
export function useSearchSuggestions(
  getSuggestions: (query: string) => Promise<string[]> | string[],
  options: UseSearchOptions = {}
) {
  return useDebouncedSearch(getSuggestions, {
    delay: 150, // Very fast for suggestions
    minLength: 1,
    ...options
  })
}

/**
 * Simple debounce hook for any value
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Advanced search hook with multiple search types
 */
export function useAdvancedSearch<T>(
  searchFunctions: {
    instant?: (query: string) => T[]
    debounced?: (query: string) => Promise<T[]>
    suggestions?: (query: string) => Promise<string[]>
  },
  options: UseSearchOptions = {}
) {
  const [query, setQuery] = useState('')
  const [instantResults, setInstantResults] = useState<T[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  
  // Debounced search for main results
  const debouncedSearch = useDebouncedSearch(
    searchFunctions.debounced || (() => []),
    options
  )
  
  // Suggestions search with faster debouncing
  const suggestionsSearch = useSearchSuggestions(
    searchFunctions.suggestions || (() => []),
    { delay: 150, minLength: 1 }
  )

  // Handle query changes
  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery)
    
    // Update main search
    debouncedSearch.setQuery(newQuery)
    
    // Update suggestions
    if (searchFunctions.suggestions) {
      suggestionsSearch.setQuery(newQuery)
    }
    
    // Instant search for immediate feedback
    if (searchFunctions.instant && newQuery.trim()) {
      setInstantResults(searchFunctions.instant(newQuery))
    } else {
      setInstantResults([])
    }
  }, [debouncedSearch, suggestionsSearch, searchFunctions])

  // Update suggestions when suggestionsSearch results change
  useEffect(() => {
    setSuggestions(suggestionsSearch.results)
  }, [suggestionsSearch.results])

  return {
    query,
    setQuery: handleQueryChange,
    clearSearch: () => {
      setQuery('')
      setInstantResults([])
      setSuggestions([])
      debouncedSearch.clearSearch()
      suggestionsSearch.clearSearch()
    },
    
    // Main search results
    results: debouncedSearch.results,
    isLoading: debouncedSearch.isLoading,
    error: debouncedSearch.error,
    hasSearched: debouncedSearch.hasSearched,
    
    // Instant results
    instantResults,
    
    // Suggestions
    suggestions,
    suggestionsLoading: suggestionsSearch.isLoading,
    
    // Utils
    retry: debouncedSearch.retry,
    isMinLength: query.length >= (options.minLength || 2)
  }
}