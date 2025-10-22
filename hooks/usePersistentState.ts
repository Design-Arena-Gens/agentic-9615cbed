'use client';

import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

const isBrowser = typeof window !== 'undefined';

function readValue<T>(key: string, fallback: T): T {
  if (!isBrowser) {
    return fallback;
  }

  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) {
      return fallback;
    }
    return JSON.parse(stored) as T;
  } catch (error) {
    console.warn(`Failed to parse localStorage item "${key}":`, error);
    return fallback;
  }
}

export function usePersistentState<T>(key: string, initialValue: T): [T, Dispatch<SetStateAction<T>>, boolean, () => void] {
  const [value, setValue] = useState<T>(() => readValue(key, initialValue));
  const [hasHydrated, setHasHydrated] = useState(isBrowser);
  const initialRef = useRef(true);

  useEffect(() => {
    if (initialRef.current) {
      initialRef.current = false;
      setHasHydrated(true);
      return;
    }

    if (!isBrowser) {
      return;
    }

    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Failed to write localStorage item "${key}":`, error);
    }
  }, [key, value]);

  const reset = () => {
    setValue(initialValue);
    if (isBrowser) {
      window.localStorage.removeItem(key);
    }
  };

  return [value, setValue, hasHydrated, reset];
}
