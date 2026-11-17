import { useEffect, useLayoutEffect, useRef } from 'react';

const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(',');

/** Open dialogs, newest last. Only the top one answers Tab and Escape, so a dialog opened from a dialog works. */
const openDialogs: HTMLElement[] = [];

const focusablesIn = (root: HTMLElement): HTMLElement[] =>
  Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
    el => el.getClientRects().length > 0 && !el.closest('[inert]')
  );

interface UseDialogOptions {
  /** Called on Escape. Leave it out for a dialog the student must answer (no Escape close). */
  onClose?: () => void;
  /** Accessible name when the dialog has no visible heading to point at. */
  label?: string;
  /** Id of the dialog's visible heading. Preferred over `label`. */
  labelledBy?: string;
  /** For a dialog that stays mounted while hidden. Defaults to true (the usual "render only when open"). */
  open?: boolean;
}

/**
 * Keyboard and screen-reader behaviour for a modal panel:
 * - focus moves into the panel when it opens (unless something inside already has it, e.g. autoFocus);
 * - Tab and Shift+Tab cycle inside the panel instead of reaching the page behind it;
 * - Escape calls `onClose`;
 * - focus returns to whatever had it before (usually the button that opened the dialog).
 *
 * Spread the returned props on the panel element (not the dimmed backdrop):
 *   const dialog = useDialog({ onClose, labelledBy: 'contact-title' });
 *   <div {...dialog}>...</div>
 */
export function useDialog<T extends HTMLElement = HTMLDivElement>({ onClose, label, labelledBy, open = true }: UseDialogOptions) {
  const ref = useRef<T>(null);
  const onCloseRef = useRef(onClose);

  useLayoutEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const panel = ref.current;
    if (!open || !panel) return;

    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    openDialogs.push(panel);

    if (!panel.contains(document.activeElement)) {
      (focusablesIn(panel)[0] ?? panel).focus({ preventScroll: true });
    }

    const onKeyDown = (e: KeyboardEvent) => {
      if (openDialogs[openDialogs.length - 1] !== panel) return;
      if (e.key === 'Escape' && onCloseRef.current) {
        e.preventDefault();
        e.stopPropagation();
        onCloseRef.current();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = focusablesIn(panel);
      if (items.length === 0) {
        e.preventDefault();
        panel.focus({ preventScroll: true });
        return;
      }
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panel.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (active === last || !panel.contains(active))) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      const i = openDialogs.lastIndexOf(panel);
      if (i !== -1) openDialogs.splice(i, 1);
      if (previous && previous.isConnected) previous.focus({ preventScroll: true });
    };
  }, [open]);

  return {
    ref,
    role: 'dialog' as const,
    'aria-modal': true as const,
    'aria-label': labelledBy ? undefined : label,
    'aria-labelledby': labelledBy,
    tabIndex: -1,
  };
}
