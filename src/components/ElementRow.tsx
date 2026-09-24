import { memo } from 'react';
import type { GradeElement } from '../types';

interface ElementRowProps {
  element: GradeElement;
  onScoreChange: (elementId: string, score: number | null) => void;
  onWeightChange: (elementId: string, weight: number) => void;
}

const SIMULATED_DEFAULT = 10;

function ElementRowInner({ element, onScoreChange, onWeightChange }: ElementRowProps) {
  const isPending = element.score === null;
  const sliderValue = element.score ?? SIMULATED_DEFAULT;
  const handleScore = (value: number) => onScoreChange(element.id, value);
  const handleWeight = (value: number) => onWeightChange(element.id, value);

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
            onChange={(e) => handleWeight(Number(e.target.value))}
            aria-label={`Pondération de ${element.name}`}
            className="w-14 rounded-md border bg-transparent px-1.5 py-1 text-right text-xs tabular"
            style={{ borderColor: 'var(--border)', color: 'var(--fg-muted)' }}
          />
          <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
            %
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="range"
          className="valida-slider"
          min={0}
          max={20}
          step={0.25}
          value={sliderValue}
          onChange={(e) => handleScore(Number(e.target.value))}
          aria-label={`${isPending ? 'Note simulée pour' : 'Note pour'} ${element.name}`}
        />
        <span
          className={
            isPending
              ? 'tabular w-14 shrink-0 rounded-md px-2 py-1 text-right text-sm font-semibold'
              : 'tabular w-14 shrink-0 rounded-md border px-2 py-1 text-right text-sm font-semibold'
          }
          style={
            isPending
              ? { backgroundColor: 'var(--color-stamp)', color: 'var(--color-paper)' }
              : { borderColor: 'var(--border)', color: 'var(--fg)' }
          }
        >
          {sliderValue.toFixed(2)}
        </span>
      </div>
    </div>
  );
}

export const ElementRow = memo(ElementRowInner);
