import { useCallback, useRef } from 'react';

export const useMemoizedCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: any[]
): T => {
  const ref = useRef<T>(callback);
  
  ref.current = callback;
  
  return useCallback((...args: any[]) => {
    return ref.current(...args);
  }, deps) as T;
}; 