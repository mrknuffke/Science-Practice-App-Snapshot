import { useEffect, useLayoutEffect, useRef } from 'react';

/**
 * Keyboard shortcuts on the window, with a handler that always sees the latest props and state.
 *
 * A plain `useEffect` listener keeps the handler from the render that registered it. If its
 * dependency list misses one value (a timer flag, a mode toggle), a key press acts on old state
 * while a click on the same button acts on new state. Here the listener is registered once and
 * calls whatever handler the latest render passed in, so there is no dependency list to get wrong.
 */
export function useWindowKeydown(handler: (e: KeyboardEvent) => void, enabled: boolean = true): void {
  const handlerRef = useRef(handler);

  useLayoutEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!enabled) return;
    const listener = (e: KeyboardEvent) => handlerRef.current(e);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [enabled]);
}
