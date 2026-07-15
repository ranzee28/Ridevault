import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';

interface UseSupabaseQueryOptions<T> {
  /** Query function that returns Supabase promise */
  queryFn: () => Promise<{ data: T | null; error: any }>;
  /** Run query immediately on mount */
  immediate?: boolean;
  /** Dependencies to re-run query when changed */
  deps?: any[];
}

interface UseSupabaseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Generic hook for Supabase queries with loading / error / refetch pattern.
 */
export function useSupabaseQuery<T>(
  options: UseSupabaseQueryOptions<T>
): UseSupabaseQueryResult<T> {
  const { queryFn, immediate = true, deps = [] } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: result, error: err } = await queryFn();
      if (!mounted.current) return;
      if (err) throw err;
      setData(result);
    } catch (err: any) {
      if (!mounted.current) return;
      setError(err.message || 'An error occurred');
    } finally {
      if (mounted.current) setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    if (immediate) execute();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [execute]);

  return { data, loading, error, refetch: execute };
}
