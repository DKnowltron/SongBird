'use client';

import { useCallback, useRef, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface SearchInputProps {
  defaultValue?: string;
  placeholder?: string;
}

export function SearchInput({
  defaultValue,
  placeholder = 'Search any song or artist...',
}: SearchInputProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initialValue = defaultValue ?? searchParams.get('q') ?? '';
  const [value, setValue] = useState(initialValue);

  // Keep value in sync if searchParams change externally
  useEffect(() => {
    const q = searchParams.get('q') ?? '';
    if (q !== value && defaultValue === undefined) {
      setValue(q);
    }
    // Only react to searchParams changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const navigate = useCallback(
    (query: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (query.trim()) {
        params.set('q', query.trim());
      } else {
        params.delete('q');
      }
      const qs = params.toString();
      router.push(qs ? `?${qs}` : window.location.pathname);
    },
    [router, searchParams],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const next = e.target.value;
      setValue(next);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => navigate(next), 300);
    },
    [navigate],
  );

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (timerRef.current) clearTimeout(timerRef.current);
      navigate(value);
    },
    [navigate, value],
  );

  return (
    <form onSubmit={handleSubmit} className="relative w-full">
      <span className="absolute left-[18px] top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-lg pointer-events-none">
        &#128269;
      </span>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full py-[18px] pr-6 pl-[52px] bg-[var(--surface)] border border-[var(--border-color)] rounded-xl text-[var(--text)] text-base font-[inherit] placeholder:text-[var(--text-muted)] transition-all duration-200 focus:outline-none focus:border-[var(--accent)] focus:shadow-[0_0_0_3px_var(--accent-glow)]"
      />
    </form>
  );
}
