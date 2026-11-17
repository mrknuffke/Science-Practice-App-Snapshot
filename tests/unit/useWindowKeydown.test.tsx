import React, { useState } from 'react';
import { describe, it, expect } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { useWindowKeydown } from '../../hooks/useWindowKeydown';

// The bug this hook prevents: a keyboard shortcut acting on state from an older render.
const Counter: React.FC = () => {
  const [count, setCount] = useState(0);
  const [locked, setLocked] = useState(false);
  useWindowKeydown(e => {
    if (e.code === 'Space' && !locked) setCount(count + 1);
  });
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={() => setLocked(true)}>Lock</button>
    </div>
  );
};

describe('useWindowKeydown', () => {
  it('calls the handler from the latest render', () => {
    const { getByTestId, getByText } = render(<Counter />);
    act(() => { fireEvent.keyDown(window, { code: 'Space' }); });
    act(() => { fireEvent.keyDown(window, { code: 'Space' }); });
    expect(getByTestId('count').textContent).toBe('2');

    act(() => { fireEvent.click(getByText('Lock')); });
    act(() => { fireEvent.keyDown(window, { code: 'Space' }); });
    expect(getByTestId('count').textContent).toBe('2');
  });
});
