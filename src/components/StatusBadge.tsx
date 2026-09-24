import { memo } from 'react';
import { CheckCircle2, AlertTriangle, Hourglass } from 'lucide-react';

export type SemesterStatusKind = 'validated' | 'rattrapage' | 'incomplete';

const CONFIG: Record<
  SemesterStatusKind,
  { label: string; icon: typeof CheckCircle2; fg: string; bg: string }
> = {
  validated: {
    label: 'Semestre validé 🎉',
    icon: CheckCircle2,
    fg: 'var(--color-valide)',
    bg: 'var(--color-valide-soft)',
  },
  rattrapage: {
    label: 'Rattrapage requis ⚠️',
    icon: AlertTriangle,
    fg: 'var(--color-rattrapage)',
    bg: 'var(--color-rattrapage-soft)',
  },
  incomplete: {
    label: 'En cours de calcul…',
    icon: Hourglass,
    fg: 'var(--fg-muted)',
    bg: 'var(--bg-panel-dim)',
  },
};

export const StatusBadge = memo(function StatusBadge({ status }: { status: SemesterStatusKind }) {
  const { label, icon: Icon, fg, bg } = CONFIG[status];
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-medium"
      style={{ color: fg, backgroundColor: bg }}
    >
      <Icon size={16} strokeWidth={2.25} />
      {label}
    </span>
  );
});
