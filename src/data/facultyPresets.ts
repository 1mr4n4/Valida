import type { FacultyPreset, SemesterSettings } from '../types';

function preset(
  id: string,
  name: string,
  description: string,
  settings: Omit<SemesterSettings, 'systemScale'>,
): FacultyPreset {
  return { id, name, description, settings: { ...settings, systemScale: 20 } };
}

/**
 * Ready-made rule sets. Thresholds are the usual LMD values — pick the one
 * matching your faculty's charte pédagogique, the dashboard recomputes every
 * status (validé / compensé / rattrapage / éliminatoire) immediately.
 */
export const facultyPresets: FacultyPreset[] = [
  preset('standard', 'Standard LMD', 'Validation à 10/20, éliminatoire sous 5/20, compensation autorisée.', {
    validationThreshold: 10,
    eliminatoryThreshold: 5,
    compensationAllowed: true,
  }),
  preset('seuil-7', 'Éliminatoire à 7/20', 'Même validation, mais toute note sous 7/20 devient éliminatoire.', {
    validationThreshold: 10,
    eliminatoryThreshold: 7,
    compensationAllowed: true,
  }),
  preset('sans-compensation', 'Sans compensation', 'Un module sous 10/20 passe en rattrapage, quelle que soit la moyenne du semestre.', {
    validationThreshold: 10,
    eliminatoryThreshold: 5,
    compensationAllowed: false,
  }),
  preset('strict', 'Validation à 12/20', 'Sélectif : il faut 12/20 pour valider directement un module.', {
    validationThreshold: 12,
    eliminatoryThreshold: 5,
    compensationAllowed: true,
  }),
];

export const DEFAULT_PRESET_ID = 'standard';

/** Returns the preset matching these settings exactly, if any. */
export function matchPresetId(settings: SemesterSettings): string | null {
  return (
    facultyPresets.find(
      (p) =>
        p.settings.validationThreshold === settings.validationThreshold &&
        p.settings.eliminatoryThreshold === settings.eliminatoryThreshold &&
        p.settings.compensationAllowed === settings.compensationAllowed,
    )?.id ?? null
  );
}

export function getPreset(id: string): FacultyPreset | undefined {
  return facultyPresets.find((p) => p.id === id);
}
