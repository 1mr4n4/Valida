interface SummaryPillsProps {
  valide: number;
  compense: number;
  rattrapage: number;
}

const PILLS: Array<{ key: keyof SummaryPillsProps; label: string; color: string }> = [
  { key: 'valide', label: 'validés', color: 'var(--color-valide)' },
  { key: 'compense', label: 'compensés', color: 'var(--color-compense)' },
  { key: 'rattrapage', label: 'en rattrapage', color: 'var(--color-rattrapage)' },
];

export function SummaryPills(props: SummaryPillsProps) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {PILLS.map(({ key, label, color }) => (
        <div
          key={key}
          className="flex items-center gap-2 rounded-lg border px-3 py-2"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-panel)' }}
        >
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          <span className="tabular text-base font-semibold" style={{ color: 'var(--fg)' }}>
            {props[key]}
          </span>
          <span className="text-sm" style={{ color: 'var(--fg-muted)' }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
