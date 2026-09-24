/**
 * Core data model for Valida — a 20-point LMD grade & rattrapage simulator.
 */

export type ModuleStatus =
  | 'valide'
  | 'compense'
  | 'rattrapage'
  | 'elimine'
  | 'pending';

export interface GradeElement {
  id: string;
  name: string; // e.g. "Contrôle Continu / TD", "Examen Final", "TP"
  weight: number; // percentage of the module grade, e.g. 30 for 30%
  score: number | null; // out of 20; null if not yet taken/entered
}

export interface UniversityModule {
  id: string;
  code?: string; // e.g. "M1", "ECO101"
  name: string; // e.g. "Microéconomie I"
  coefficient: number; // relative weight of this module within the semester
  elements: GradeElement[];
  targetScore?: number; // last simulated score for the pending element, out of 20
}

export interface SemesterSettings {
  validationThreshold: number; // default: 10
  eliminatoryThreshold: number; // default: 5 (some faculties use 7)
  compensationAllowed: boolean; // default: true
  systemScale: 20;
}

export interface SemesterData {
  id: string;
  title: string; // e.g. "Semestre 1 — FSJES"
  settings: SemesterSettings;
  modules: UniversityModule[];
}

/** A named bundle of academic rules (thresholds + compensation policy). */
export interface FacultyPreset {
  id: string;
  name: string;
  description: string;
  settings: SemesterSettings;
}

/** A ready-made semester structure the user can start a session from. */
export interface SemesterTemplate {
  id: string;
  name: string;
  description: string;
  /** Preset applied to the semester's settings when the template is loaded. */
  presetId: string;
  build: () => SemesterData;
}

/** Aggregate counts used by the hero dashboard's summary pills. */
export interface SemesterSummary {
  average: number | null;
  status: 'validated' | 'rattrapage' | 'incomplete';
  hasEliminatoryFailure: boolean;
  counts: Record<Exclude<ModuleStatus, 'pending'> | 'pending', number>;
}

export const DEFAULT_SETTINGS: SemesterSettings = {
  validationThreshold: 10,
  eliminatoryThreshold: 5,
  compensationAllowed: true,
  systemScale: 20,
};
