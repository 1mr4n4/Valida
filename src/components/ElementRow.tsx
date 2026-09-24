import type { GradeElement } from '../types';

interface ElementRowProps {
  element: GradeElement;
  onScoreChange: (score: number | null) => void;
  onWeightChange: (weight: number) => void;
}

const SIMULATED_DEFAULT = 10;

export function ElementRow({ element, onScoreChange, onWeightChange }: ElementRowProps) {
  const isPending = element.score === null;
  const sliderValue = element.score ?? SIMULATED_DEFAULT;

  return (
    <div className="flex flex-col gap-2 py-3">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm" style={{ color: 'var(--fg)' }}>
          {element.name}
        </span>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={0}
            max={100}
            value={element.weight}
            onChange={(e) => onWeightChange(Number(e.target.value))}
            aria-label={`Pondération de ${element.name}`}
            className="w-14 rounded-md border bg-transparent px-1.5 py-1 text-right text-xs tabular"
            style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
          />
          <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
            %
          </span>
        </div>
      </div>

      {isPending ? (
        <div className="flex items-center gap-3">
          <input
            type="range"
            className="valida-slider"
            min={0}
            max={20}
            step={0.25}
            value={sliderValue}
            onChange={(e) => onScoreChange(Number(e.target.value))}
            aria-label={`Note simulée pour ${element.name}`}
          />
          <span
            className="tabular w-14 shrink-0 rounded-md px-2 py-1 text-right text-sm font-semibold"
            style={{ backgroundColor: 'var(--color-stamp)', color: 'var(--color-paper)' }}
          >
            {sliderValue.toFixed(2)}
          </span>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <input
            type="range"
            className="valida-slider"
            min={0}
            max={20}
            step={0.25}
            value={element.score as number}
            onChange={(e) => onScoreChange(Number(e.target.value))}
            aria-label={`Note pour ${element.name}`}
          />
          <span
            className="tabular w-14 shrink-0 rounded-md border px-2 py-1 text-right text-sm font-semibold"
            style={{ borderColor: 'var(--border)', color: 'var(--fg)' }}
          >
            {(element.score as number).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}
