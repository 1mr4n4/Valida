import { memo } from 'react';
import { Target, TrendingUp, AlertTriangle } from 'lucide-react';
import type { SemesterData, UniversityModule } from '../types';
import {
  calculateRequiredFinalScoreExact,
  calculateRequiredScoreForSemesterTargetExact,
  findPendingElement,
} from '../utils/calculations';

interface TargetSimulatorProps {
  semester: SemesterData;
  module: UniversityModule;
}

function formatTarget(exact: number | null): string {
  if (exact === null) return '';
  if (exact <= 0) return 'déjà acquis, quel que soit le résultat restant';
  if (exact > 20) return 'hors de portée, même avec 20/20';
  return `au moins ${exact.toFixed(2)}/20`;
}

function TargetSimulatorInner({ semester, module }: TargetSimulatorProps) {
  const pending = findPendingElement(module);
  if (!pending) return null;

  const { settings, modules } = semester;

  const moduleTargetExact = calculateRequiredFinalScoreExact(
    module,
    settings.validationThreshold,
    pending.id,
  );
  const semesterTargetExact = calculateRequiredScoreForSemesterTargetExact(
    modules,
    module.id,
    settings.validationThreshold,
    pending.id,
  );

  return (
    <div
      className="mt-1 flex flex-col gap-2.5 rounded-lg border px-4 py-3.5"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-panel-dim)' }}
    >
      {moduleTargetExact !== null && (
        <div className="flex items-start gap-2.5 text-sm">
          <Target size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--color-stamp)' }} />
          <p style={{ color: 'var(--fg)' }}>
            Il vous faut <strong className="tabular">{formatTarget(moduleTargetExact)}</strong> à{' '}
            {pending.name.toLowerCase()} pour valider ce module directement (
            {settings.validationThreshold.toFixed(0)}/20).
          </p>
        </div>
      )}

      {semesterTargetExact !== null && (
        <div className="flex items-start gap-2.5 text-sm">
          <TrendingUp
            size={16}
            className="mt-0.5 shrink-0"
            style={{ color: 'var(--color-stamp)' }}
          />
          <p style={{ color: 'var(--fg)' }}>
            Il vous faut <strong className="tabular">{formatTarget(semesterTargetExact)}</strong>{' '}
            pour porter la moyenne du semestre à {settings.validationThreshold.toFixed(2)}.
          </p>
        </div>
      )}

      <div className="flex items-start gap-2.5 text-sm">
        <AlertTriangle
          size={16}
          className="mt-0.5 shrink-0"
          style={{ color: 'var(--color-rattrapage)' }}
        />
        <p style={{ color: 'var(--fg)' }}>
          Attention : toute note inférieure à{' '}
          <strong className="tabular">{settings.eliminatoryThreshold.toFixed(2)}</strong>{' '}
          déclenche une note éliminatoire, quelle que soit la moyenne du semestre.
        </p>
      </div>
    </div>
  );
}

export const TargetSimulator = memo(TargetSimulatorInner);
