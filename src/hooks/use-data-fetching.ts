import { useState, useEffect, useCallback, useRef } from 'react';

interface FetchOptions<T> {
  pageSize?: number;
  initialData?: T[];
  cacheKey?: string;
  cacheDuration?: number; // in milliseconds
}

interface PaginatedData<T> {
  data: T[];
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
  totalItems: number;
  currentPage: number;
}

// Simple in-memory cache
const cache: Record<string, { data: any; timestamp: number }> = {};

export function useDataFetching<T>(
  fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>,
  options: FetchOptions<T> = {}
): PaginatedData<T> {
  const {
    pageSize = 10,
    initialData = [],
    cacheKey,
    cacheDuration = 5 * 60 * 1000, // 5 minutes default
  } = options;

  const [data, setData] = useState<T[]>(initialData);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalItems, setTotalItems] = useState<number>(0);
  
  // Use a ref to track if the component is mounted
  const isMounted = useRef(true);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchData = useCallback(async (page: number, refresh = false) => {
    // Skip if we're already at the end and not refreshing
    if (!hasMore && page > 0 && !refresh) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Check cache first if cacheKey is provided
      if (cacheKey && !refresh && page === 0) {
        const cachedData = cache[cacheKey];
        const now = Date.now();
        
        if (cachedData && (now - cachedData.timestamp) < cacheDuration) {
          if (isMounted.current) {
            setData(cachedData.data.data);
            setTotalItems(cachedData.data.total);
            setHasMore(cachedData.data.data.length < cachedData.data.total);
            setIsLoading(false);
          }
          return;
        }
      }
      
      const result = await fetchFn(page, pageSize);
      
      if (isMounted.current) {
        if (refresh || page === 0) {
          setData(result.data);
        } else {
          setData(prevData => [...prevData, ...result.data]);
        }
        
        setTotalItems(result.total);
        setHasMore(result.data.length > 0 && (page + 1) * pageSize < result.total);
        
        // Update cache if cacheKey is provided
        if (cacheKey && page === 0) {
          cache[cacheKey] = {
            data: result,
            timestamp: Date.now()
          };
        }
      }
    } catch (err) {
      if (isMounted.current) {
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      }
    } finally {
      if (isMounted.current) {
        setIsLoading(false);
      }
    }
  }, [fetchFn, pageSize, cacheKey, cacheDuration, hasMore]);

  // Initial fetch and refresh
  useEffect(() => {
    fetchData(0, true);
  }, [fetchData]);

  // Load more data function
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchData(nextPage);
    }
  }, [isLoading, hasMore, currentPage, fetchData]);

  // Refresh function
  const refresh = useCallback(() => {
    setCurrentPage(0);
    fetchData(0, true);
  }, [fetchData]);

  return { data, isLoading, error, hasMore, loadMore, refresh, totalItems, currentPage };
}

// Helper function to clear entire cache
export function clearCache(): void {
  Object.keys(cache).forEach(key => delete cache[key]);
}

// Helper function to invalidate specific cache entries
export function invalidateCache(keyPattern: string | RegExp): void {
  Object.keys(cache).forEach(key => {
    if (typeof keyPattern === 'string' ? key.includes(keyPattern) : keyPattern.test(key)) {
      delete cache[key];
    }
  });
} 