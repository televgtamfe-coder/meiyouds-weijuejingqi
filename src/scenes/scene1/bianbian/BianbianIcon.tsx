export function BianbianIcon({ type = 'scan' }: { type?: 'scan' | 'camera' | 'back' | 'check' }) {
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {type === 'back' ? <path d="m14 6-6 6 6 6" /> : type === 'check' ? <path d="m5 12 4 4L19 6" /> : type === 'camera' ? <><path d="M8 6 9.5 3.5h5L16 6h3a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z"/><circle cx="12" cy="12.5" r="3.5" /></> : <><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/><rect x="7" y="7" width="10" height="10" rx="4"/><path d="M9.5 12h.01M14.5 12h.01M10 14.5q2 1.5 4 0"/></>}
  </svg>;
}
