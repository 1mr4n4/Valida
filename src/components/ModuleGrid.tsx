import { memo, useMemo } from 'react';
import type { SemesterData } from '../types';
import { calculateSemesterAverage, semesterHasEliminatoryFailure } from '../utils/calculations';
import { ModuleCard } from './ModuleCard';

interface ModuleGridProps {
  semester: SemesterData;
  onScoreChange: (moduleId: string, elementId: string, score: number | null) => void;
  onWeightChange: (moduleId: string, elementId: string, weight: number) => void;
}

export const ModuleGrid = memo(function ModuleGrid({
  semester,
  onScoreChange,
  onWeightChange,
}: ModuleGridProps) {
  const { modules, settings } = semester;
  const semesterAverage = useMemo(() => calculateSemesterAverage(modules), [modules]);
  const hasEliminatoryFailureInSemester = useMemo(
    () => semesterHasEliminatoryFailure(modules, settings),
    [modules, settings],
  );

  return (
    <div className="mt-6 flex flex-col gap-3">
      {modules.map((module) => (
        <ModuleCard
          key={module.id}
          semester={semester}
          module={module}
          semesterAverage={semesterAverage}
          hasEliminatoryFailureInSemester={hasEliminatoryFailureInSemester}
          onScoreChange={onScoreChange}
          onWeightChange={onWeightChange}
        />
      ))}
    </div>
  );
});
