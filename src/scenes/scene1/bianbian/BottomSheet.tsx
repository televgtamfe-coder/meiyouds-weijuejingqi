import { ReactNode, useEffect, useRef } from 'react';

/** Focus and dismissal behavior added to UI Kit's bottom-sheet component. */
export function BottomSheet({ title, onClose, children, className = '' }: { title: string; onClose: () => void; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement;
    const first = ref.current?.querySelector<HTMLElement>('button, input, select');
    (first || ref.current)?.focus();
    return () => { window.setTimeout(() => { if (previous?.isConnected) previous.focus(); }, 0); };
  }, []);
  return <div className="bb-sheet-mask" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div ref={ref} className={`bb-bottom-sheet ${className}`} role="dialog" aria-modal="true" aria-label={title} tabIndex={-1} onKeyDown={e => {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); }
      if (e.key !== 'Tab') return;
      const elements = Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]') || []);
      const first = elements[0], last = elements[elements.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }}>{children}</div>
  </div>;
}
