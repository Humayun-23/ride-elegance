import { useMemo } from 'react';
import { Search } from 'lucide-react';

// Kept separate so the heavy command dialog can be lazy-loaded only when opened.
export default function CommandPaletteTrigger({ onClick }: { onClick: () => void }) {
  const mac = useMemo(() => typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.platform || navigator.userAgent), []);

  return (
    <button
      type="button"
      onClick={onClick}
      className="rl-cmd group hidden md:flex items-center gap-2 h-8 w-full max-w-[420px] rounded-md px-2.5 text-[13px]"
      aria-label="Open command palette"
    >
      <Search className="w-3.5 h-3.5 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
      <span className="flex-1 text-left truncate opacity-70 group-hover:opacity-100 transition-opacity">Search customer, booking, or jump to...</span>
      <span className="rl-kbd opacity-50 group-hover:opacity-100 transition-opacity">{mac ? '⌘' : 'Ctrl'} K</span>
    </button>
  );
}
