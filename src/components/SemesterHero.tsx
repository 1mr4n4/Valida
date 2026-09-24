import { useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import type { SemesterData } from '../types';
import {
  calculateSemesterAverage,
  determineModuleStatus,
  getMention,
  semesterHasEliminatoryFailure,
} from '../utils/calculations';
import { GPAGauge } from './GPAGauge';
import { StatusBadge, type SemesterStatusKind } from './StatusBadge';
import { SummaryPills } from './SummaryPills';
import { ThemeToggle } from './ThemeToggle';

function fireValidationConfetti() {
  const stampBlue = '#2e4c6d';
  const valideGreen = '#3b7a3e';
  const paper = '#f6f4ee';

  confetti({
    particleCount: 90,
    spread: 70,
    startVelocity: 38,
    origin: { x: 0.5, y: 0.35 },
    colors: [stampBlue, valideGreen, paper],
    scalar: 0.9,
  });
}

export function SemesterHero({ semester }: { semester: SemesterData }) {
  const { modules, settings, title } = semester;

  const average = calculateSemesterAverage(modules);
  const hasEliminatoryFailure = semesterHasEliminatoryFailure(modules, settings);

  const statuses = modules.map((m) =>
    determineModuleStatus(m, average, settings, hasEliminatoryFailure),
  );

  const isPending = statuses.includes('pending');
  const counts = {
    valide: statuses.filter((s) => s === 'valide').length,
    compense: statuses.filter((s) => s === 'compense').length,
    rattrapage: statuses.filter((s) => s === 'rattrapage' || s === 'elimine').length,
  };

  const overallStatus: SemesterStatusKind = isPending
    ? 'incomplete'
    : counts.rattrapage > 0
      ? 'rattrapage'
      : 'validated';

  const gaugeTone =
    overallStatus === 'validated'
      ? 'valide'
      : overallStatus === 'rattrapage'
        ? 'rattrapage'
        : 'stamp';

  const mention = average !== null && overallStatus === 'validated' ? getMention(average) : null;

  const previousStatus = useRef<SemesterStatusKind | null>(null);
  useEffect(() => {
    if (overallStatus === 'validated' && previousStatus.current !== 'validated') {
      fireValidationConfetti();
    }
    previousStatus.current = overallStatus;
  }, [overallStatus]);

  return (
    <section
      className="rounded-2xl border p-6 sm:p-8"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-panel)' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
            Tableau de bord
          </p>
          <h1 className="font-display mt-1 text-2xl font-medium sm:text-3xl" style={{ color: 'var(--fg)' }}>
            {title}
          </h1>
        </div>
        <ThemeToggle />
      </div>

      <div className="mt-8 flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:justify-between">
        <GPAGauge average={average} tone={gaugeTone} />

        <div className="flex flex-col items-center gap-4 sm:items-start">
          <StatusBadge status={overallStatus} />
          {mention && (
            <p className="text-sm" style={{ color: 'var(--fg-muted)' }}>
              Mention : <span style={{ color: 'var(--fg)' }}>{mention}</span>
            </p>
          )}
          <SummaryPills {...counts} />
        </div>
      </div>
    </section>
  );
}
