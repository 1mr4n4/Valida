import type { SemesterData } from '../types';
import { calculateSemesterAverage, semesterHasEliminatoryFailure } from '../utils/calculations';
import { ModuleCard } from './ModuleCard';

interface ModuleGridProps {
  semester: SemesterData;
  onScoreChange: (moduleId: string, elementId: string, score: number | null) => void;
  onWeightChange: (moduleId: string, elementId: string, weight: number) => void;
}

export function ModuleGrid({ semester, onScoreChange, onWeightChange }: ModuleGridProps) {
  const semesterAverage = calculateSemesterAverage(semester.modules);
  const hasEliminatoryFailureInSemester = semesterHasEliminatoryFailure(
    semester.modules,
    semester.settings,
  );

  return (
    <div className="mt-6 flex flex-col gap-3">
      {semester.modules.map((module) => (
        <ModuleCard
          key={module.id}
          semester={semester}
          module={module}
          semesterAverage={semesterAverage}
          hasEliminatoryFailureInSemester={hasEliminatoryFailureInSemester}
          onScoreChange={(elementId, score) => onScoreChange(module.id, elementId, score)}
          onWeightChange={(elementId, weight) => onWeightChange(module.id, elementId, weight)}
        />
      ))}
    </div>
  );
}
