'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

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
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred');
        }
      })
      .finally(() => setLoading(false));
  }, [path, session, refetchCount]);

  return { data, error, loading, refetch };
}

export function useApiMutation<TInput, TResult = unknown>(
  path: string,
  method: string = 'POST',
) {
  const { session } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = async (body?: TInput): Promise<TResult | null> => {
    if (!session) return null;

    setLoading(true);
    setError(null);

    try {
      const result = await api<TResult>(path, {
        method,
        body,
        token: session.access_token,
      });
      return result;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}
