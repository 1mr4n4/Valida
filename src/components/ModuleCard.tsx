import { memo, useCallback, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { SemesterData, UniversityModule } from '../types';
import { calculateModuleGrade, determineModuleStatus } from '../utils/calculations';
import { ModuleStatusPill, statusAccentColor } from './ModuleStatusPill';
import { ElementRow } from './ElementRow';
import { TargetSimulator } from './TargetSimulator';

interface ModuleCardProps {
  semester: SemesterData;
  module: UniversityModule;
  semesterAverage: number | null;
  hasEliminatoryFailureInSemester: boolean;
  onScoreChange: (moduleId: string, elementId: string, score: number | null) => void;
  onWeightChange: (moduleId: string, elementId: string, weight: number) => void;
}

function ModuleCardInner({
  semester,
  module,
  semesterAverage,
  hasEliminatoryFailureInSemester,
  onScoreChange,
  onWeightChange,
}: ModuleCardProps) {
  const [expanded, setExpanded] = useState(false);

  const handleScoreChange = useCallback(
    (elementId: string, score: number | null) => onScoreChange(module.id, elementId, score),
    [onScoreChange, module.id],
  );
  const handleWeightChange = useCallback(
    (elementId: string, weight: number) => onWeightChange(module.id, elementId, weight),
    [onWeightChange, module.id],
  );

  const grade = calculateModuleGrade(module);
  const status = determineModuleStatus(
    module,
    semesterAverage,
    semester.settings,
    hasEliminatoryFailureInSemester,
  );
  const accent = statusAccentColor(status);
  const hasPending = module.elements.some((el) => el.score === null);

  return (
    <div
      className="flex overflow-hidden rounded-xl border"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-panel)' }}
    >
      <div className="w-1 shrink-0" style={{ backgroundColor: accent }} aria-hidden="true" />

      <div className="flex-1">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:px-5"
        >
          <div className="min-w-0">
            <div className="flex items-baseline gap-2">
              {module.code && (
                <span className="text-xs" style={{ color: 'var(--fg-muted)' }}>
                  {module.code}
                </span>
              )}
              <h3 className="truncate text-[15px] font-medium" style={{ color: 'var(--fg)' }}>
                {module.name}
              </h3>
            </div>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--fg-muted)' }}>
              Coefficient {module.coefficient}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-3">
            <span className="tabular text-lg font-semibold" style={{ color: 'var(--fg)' }}>
              {grade === null ? '—' : grade.toFixed(2)}
            </span>
            <ModuleStatusPill status={status} />
            <span
              className={`inline-flex transition-transform duration-200 ${
                expanded ? 'rotate-180' : ''
              }`}
            >
              <ChevronDown size={18} style={{ color: 'var(--fg-muted)' }} />
            </span>
          </div>
        </button>

        <div className={`valida-collapsible${expanded ? ' is-open' : ''}`}>
          <div className="min-h-0 overflow-hidden">
            <div
              className="border-t px-4 pb-4 sm:px-5"
              style={{ borderColor: 'var(--border)' }}
            >
              <div>
                {module.elements.map((element, index) => (
                  <div
                    key={element.id}
                    style={index > 0 ? { borderTop: '1px solid var(--border)' } : undefined}
                  >
                    <ElementRow
                      element={element}
                      onScoreChange={handleScoreChange}
                      onWeightChange={handleWeightChange}
                    />
                  </div>
                ))}
              </div>

              {hasPending && (
                <div className="mt-1">
                  <TargetSimulator semester={semester} module={module} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ModuleCard = memo(ModuleCardInner);
