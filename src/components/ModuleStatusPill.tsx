import { memo } from 'react';
import type { ModuleStatus } from '../types';

const CONFIG: Record<ModuleStatus, { label: string; fg: string; bg: string }> = {
  valide: { label: 'Validé', fg: 'var(--color-valide)', bg: 'var(--color-valide-soft)' },
  compense: { label: 'Compensé', fg: 'var(--color-compense)', bg: 'var(--color-compense-soft)' },
  rattrapage: {
    label: 'Rattrapage',
    fg: 'var(--color-rattrapage)',
    bg: 'var(--color-rattrapage-soft)',
  },
  elimine: {
    label: 'Éliminatoire',
    fg: 'var(--color-rattrapage)',
    bg: 'var(--color-rattrapage-soft)',
  },
  pending: { label: 'En attente', fg: 'var(--fg-muted)', bg: 'var(--bg-panel-dim)' },
};

export const ModuleStatusPill = memo(function ModuleStatusPill({ status }: { status: ModuleStatus }) {
  const { label, fg, bg } = CONFIG[status];
  return (
    <span
      className="whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium"
      style={{ color: fg, backgroundColor: bg }}
    >
      {label}
    </span>
  );
});

/** The color used for a module card's left margin-mark accent bar. */
export function statusAccentColor(status: ModuleStatus): string {
  switch (status) {
    case 'valide':
      return 'var(--color-valide)';
    case 'compense':
      return 'var(--color-compense)';
    case 'rattrapage':
    case 'elimine':
      return 'var(--color-rattrapage)';
    case 'pending':
    default:
      return 'var(--border)';
  }
}
