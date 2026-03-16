import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from './api';
import { useAuth } from './auth-context';

interface UseApiResult<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
  refetch: () => void;
}

export function useApi<T>(path: string | null): UseApiResult<T> {
  const { session } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!path);
  const [refetchCount, setRefetchCount] = useState(0);

  const refetch = useCallback(() => setRefetchCount((c) => c + 1), []);

  useEffect(() => {
    if (!path || !session) return;

    setLoading(true);
    setError(null);

    api<T>(path, { token: session.access_token })
      .then(setData)
      .catch((err) => {
        setError(err instanceof ApiError ? err.message : 'An unexpected error occurred');
      })
      .finally(() => setLoading(false));
  }, [path, session, refetchCount]);

  return { data, error, loading, refetch };
}
