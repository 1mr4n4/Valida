import type {
  GradeElement,
  ModuleStatus,
  SemesterSettings,
  UniversityModule,
} from '../types';

/** Clamp a numeric grade into the valid 0–20 range. */
export function clampGrade(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(20, Math.max(0, value));
}

/** Total weight assigned across a module's elements (should normally be 100). */
export function totalWeight(elements: GradeElement[]): number {
  return elements.reduce((sum, el) => sum + el.weight, 0);
}

/**
 * Compute a single module's average out of 20.
 * Returns null when the module has no elements, or when any element's
 * score has not yet been entered (module grade is still "pending").
 * Weights are normalized against their sum so a 30/70 split behaves the
 * same as a 30/70 split that happens to add up to 99 or 101.
 */
export function calculateModuleGrade(module: UniversityModule): number | null {
  const { elements } = module;
  if (elements.length === 0) return null;
  if (elements.some((el) => el.score === null)) return null;

  const weightSum = totalWeight(elements);
  if (weightSum <= 0) return null;

  const weighted = elements.reduce(
    (sum, el) => sum + (el.score as number) * el.weight,
    0,
  );
  return clampGrade(weighted / weightSum);
}

/**
 * Compute the semester average across modules, weighted by coefficient.
 * Modules that are still pending (no grade yet) are excluded from the
 * calculation so the dashboard can show a live, partial GPA as the
 * student fills in grades — rather than blocking on a full data set.
 * Returns null if no module has a computable grade yet.
 */
export function calculateSemesterAverage(
  modules: UniversityModule[],
): number | null {
  const graded = modules
    .map((m) => ({ coefficient: m.coefficient, grade: calculateModuleGrade(m) }))
    .filter((m): m is { coefficient: number; grade: number } => m.grade !== null);

  if (graded.length === 0) return null;

  const coefficientSum = graded.reduce((sum, m) => sum + m.coefficient, 0);
  if (coefficientSum <= 0) return null;

  const weighted = graded.reduce((sum, m) => sum + m.grade * m.coefficient, 0);
  return clampGrade(weighted / coefficientSum);
}

/** Whether at least one module in the semester has an eliminatory grade. */
export function semesterHasEliminatoryFailure(
  modules: UniversityModule[],
  settings: SemesterSettings,
): boolean {
  return modules.some((m) => {
    const grade = calculateModuleGrade(m);
    return grade !== null && grade < settings.eliminatoryThreshold;
  });
}

/**
 * Determine a single module's status per the academic rules:
 * - "pending" while the module grade can't yet be computed.
 * - "elimine" (eliminatory failure) if the grade falls below the
 *   eliminatory mark — this blocks compensation for the whole semester.
 * - "valide" if the grade meets the validation threshold on its own.
 * - "compense" if the grade is below threshold but above the eliminatory
 *   mark, compensation is allowed, the semester average validates, and
 *   no module in the semester carries an eliminatory failure.
 * - "rattrapage" otherwise.
 */
export function determineModuleStatus(
  module: UniversityModule,
  semesterAverage: number | null,
  settings: SemesterSettings,
  hasEliminatoryFailureInSemester = false,
): ModuleStatus {
  const grade = calculateModuleGrade(module);
  if (grade === null) return 'pending';

  if (grade < settings.eliminatoryThreshold) return 'elimine';
  if (grade >= settings.validationThreshold) return 'valide';

  const semesterValidates =
    semesterAverage !== null && semesterAverage >= settings.validationThreshold;

  if (
    settings.compensationAllowed &&
    semesterValidates &&
    !hasEliminatoryFailureInSemester
  ) {
    return 'compense';
  }

  return 'rattrapage';
}

/**
 * Find the element that is still awaiting a grade (typically the final
 * exam). If an explicit elementId is given, use that one instead — this
 * lets the UI target a specific slider even when several elements are
 * still empty.
 */
export function findPendingElement(
  module: UniversityModule,
  elementId?: string,
): GradeElement | undefined {
  if (elementId) return module.elements.find((el) => el.id === elementId);
  return module.elements.find((el) => el.score === null);
}

/**
 * Solve for the score needed on the pending element for the module itself
 * to reach a target grade — without clamping to the 0–20 scale. Useful for
 * messaging: a raw value above 20 means the target is unreachable even
 * with a perfect score, and a raw value below 0 means it's already locked
 * in regardless of what the pending element scores.
 * Returns null when there's nothing to solve (no pending element, or the
 * pending element carries zero weight).
 */
export function calculateRequiredFinalScoreExact(
  module: UniversityModule,
  targetGrade: number,
  elementId?: string,
): number | null {
  const pending = findPendingElement(module, elementId);
  if (!pending || pending.weight <= 0) return null;

  const weightSum = totalWeight(module.elements);
  if (weightSum <= 0) return null;

  const knownWeighted = module.elements
    .filter((el) => el.id !== pending.id)
    .reduce((sum, el) => sum + (el.score ?? 0) * el.weight, 0);

  return (targetGrade * weightSum - knownWeighted) / pending.weight;
}

/**
 * Solve for the score a student needs on their pending element (e.g. the
 * final exam) for the *module itself* to reach a target grade, clamped to
 * the 0–20 scale (e.g. for positioning a slider's suggested handle).
 */
export function calculateRequiredFinalScore(
  module: UniversityModule,
  targetGrade: number,
  elementId?: string,
): number | null {
  const exact = calculateRequiredFinalScoreExact(module, targetGrade, elementId);
  return exact === null ? null : clampGrade(exact);
}

/**
 * Solve for the score needed on one module's pending element so that the
 * *overall semester average* reaches a target — holding every other
 * module's current grade constant. This powers the simulator's second
 * readout: "You need X on the final to bring your semester to 10.00."
 * Returns null if the module has no pending element, the module carries
 * zero coefficient, or every other module is still pending too (so the
 * semester average can't be reasoned about yet).
 */
export function calculateRequiredScoreForSemesterTarget(
  modules: UniversityModule[],
  moduleId: string,
  targetSemesterAverage: number,
  elementId?: string,
): number | null {
  const exact = calculateRequiredScoreForSemesterTargetExact(
    modules,
    moduleId,
    targetSemesterAverage,
    elementId,
  );
  return exact === null ? null : clampGrade(exact);
}

/** Unclamped counterpart of {@link calculateRequiredScoreForSemesterTarget}. */
export function calculateRequiredScoreForSemesterTargetExact(
  modules: UniversityModule[],
  moduleId: string,
  targetSemesterAverage: number,
  elementId?: string,
): number | null {
  const target = modules.find((m) => m.id === moduleId);
  if (!target || target.coefficient <= 0) return null;

  const pending = findPendingElement(target, elementId);
  if (!pending || pending.weight <= 0) return null;

  const others = modules.filter((m) => m.id !== moduleId);
  const othersGraded = others
    .map((m) => ({ coefficient: m.coefficient, grade: calculateModuleGrade(m) }))
    .filter((m): m is { coefficient: number; grade: number } => m.grade !== null);

  if (othersGraded.length === 0 && others.length > 0) return null;

  const othersWeightedSum = othersGraded.reduce(
    (sum, m) => sum + m.grade * m.coefficient,
    0,
  );
  const othersCoefficientSum = othersGraded.reduce((sum, m) => sum + m.coefficient, 0);
  const totalCoefficient = othersCoefficientSum + target.coefficient;

  // Required grade for the *target module* so the coefficient-weighted
  // semester average reaches targetSemesterAverage.
  const requiredModuleGrade =
    (targetSemesterAverage * totalCoefficient - othersWeightedSum) /
    target.coefficient;

  return calculateRequiredFinalScoreExact(target, requiredModuleGrade, pending.id);
}

/** Honors mention for a given average, per the standard LMD bands. */
export function getMention(average: number): 'Très Bien' | 'Bien' | 'Assez Bien' | null {
  if (average >= 16) return 'Très Bien';
  if (average >= 14) return 'Bien';
  if (average >= 12) return 'Assez Bien';
  return null;
}
