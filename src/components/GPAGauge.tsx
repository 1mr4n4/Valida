import { memo } from 'react';
import { useTweenedValue } from '../hooks/useTweenedValue';

export type GaugeTone = 'stamp' | 'valide' | 'compense' | 'rattrapage';

interface GPAGaugeProps {
  average: number | null;
  maxScale?: number;
  tone: GaugeTone;
  size?: number;
}

const TONE_COLORS: Record<GaugeTone, string> = {
  stamp: 'var(--color-stamp)',
  valide: 'var(--color-valide)',
  compense: 'var(--color-compense)',
  rattrapage: 'var(--color-rattrapage)',
};

/**
 * A stamp-like circular gauge. The ring fills clockwise from the top as the
 * semester average climbs toward 20, and the number in the center counts up
 * smoothly whenever `average` changes — the one deliberate non-interactive
 * motion moment on the dashboard.
 */
export const GPAGauge = memo(function GPAGauge({
  average,
  maxScale = 20,
  tone,
  size = 200,
}: GPAGaugeProps) {
  const displayValue = useTweenedValue(average ?? 0);
  const strokeWidth = size * 0.06;
  const radius = size / 2 - strokeWidth;
  const circumference = 2 * Math.PI * radius;

  const fraction = average === null ? 0 : Math.min(1, Math.max(0, average / maxScale));
  const dashOffset = circumference * (1 - fraction);
  const color = TONE_COLORS[tone];

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: size, height: size }}
      role="img"
      aria-label={
        average === null
          ? 'Moyenne du semestre en cours de calcul'
          : `Moyenne du semestre : ${average.toFixed(2)} sur ${maxScale}`
      }
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--border)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          style={{ transition: 'stroke 0.4s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display tabular text-5xl font-medium leading-none" style={{ color: 'var(--fg)' }}>
          {average === null ? '—' : displayValue.toFixed(2)}
        </span>
        <span className="mt-2 text-xs tracking-wide" style={{ color: 'var(--fg-muted)' }}>
          sur {maxScale} · moyenne semestre
        </span>
      </div>
    </div>
  );
});
