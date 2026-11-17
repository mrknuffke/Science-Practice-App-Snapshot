import React, { useState } from 'react';
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import { render, fireEvent, act } from '@testing-library/react';
import { useDialog } from '../../hooks/useDialog';

// jsdom does no layout, so every element reports no boxes; useDialog skips invisible elements.
const realRects = Element.prototype.getClientRects;
beforeAll(() => {
  Element.prototype.getClientRects = function () {
    return [{}] as unknown as DOMRectList;
  };
});
afterAll(() => {
  Element.prototype.getClientRects = realRects;
});

const Dialog: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const dialog = useDialog({ onClose, labelledBy: 'dlg-title' });
  return (
    <div {...dialog}>
      <h2 id="dlg-title">Title</h2>
      <button>First</button>
      <button>Last</button>
    </div>
  );
};

const Page: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button onClick={() => setOpen(true)}>Open</button>
      {open && <Dialog onClose={() => { onClose?.(); setOpen(false); }} />}
    </div>
  );
};

describe('useDialog', () => {
  it('names the panel and marks it modal', () => {
    const { getByRole } = render(<Dialog />);
    const panel = getByRole('dialog');
    expect(panel.getAttribute('aria-modal')).toBe('true');
    expect(panel.getAttribute('aria-labelledby')).toBe('dlg-title');
  });

  it('moves focus in on open, closes on Escape, and returns focus to the opener', () => {
    const onClose = vi.fn();
    const { getByText, queryByRole } = render(<Page onClose={onClose} />);
    const opener = getByText('Open');
    opener.focus();
    act(() => { fireEvent.click(opener); });
    expect(document.activeElement).toBe(getByText('First'));

    act(() => { fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' }); });
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(opener);
  });

  it('keeps Tab inside the panel', () => {
    const { getByText } = render(<Dialog />);
    const first = getByText('First');
    const last = getByText('Last');

    last.focus();
    fireEvent.keyDown(last, { key: 'Tab' });
    expect(document.activeElement).toBe(first);

    fireEvent.keyDown(first, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('ignores Escape when there is no onClose (a dialog the student must answer)', () => {
    const { getByRole } = render(<Dialog />);
    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' });
    expect(getByRole('dialog')).toBeTruthy();
  });

  it('lets only the top dialog answer Escape when one opens another', () => {
    const outer = vi.fn();
    const inner = vi.fn();
    const Nested: React.FC = () => {
      const a = useDialog({ onClose: outer, label: 'Outer' });
      const b = useDialog({ onClose: inner, label: 'Inner' });
      return (
        <>
          <div {...a}><button>A</button></div>
          <div {...b}><button>B</button></div>
        </>
      );
    };
    render(<Nested />);
    fireEvent.keyDown(document.activeElement as Element, { key: 'Escape' });
    expect(inner).toHaveBeenCalledTimes(1);
    expect(outer).not.toHaveBeenCalled();
  });
});
