import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
  onScoreChange: (elementId: string, score: number | null) => void;
  onWeightChange: (elementId: string, weight: number) => void;
}

export function ModuleCard({
  semester,
  module,
  semesterAverage,
  hasEliminatoryFailureInSemester,
  onScoreChange,
  onWeightChange,
}: ModuleCardProps) {
  const [expanded, setExpanded] = useState(false);

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
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={18} style={{ color: 'var(--fg-muted)' }} />
            </motion.span>
          </div>
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
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
                        onScoreChange={(score) => onScoreChange(element.id, score)}
                        onWeightChange={(weight) => onWeightChange(element.id, weight)}
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
