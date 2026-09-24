import type { SemesterData } from '../types';
import { DEFAULT_SETTINGS } from '../types';

/**
 * Six realistic modules for a FSJES-style "Semestre 3 — Économie & Gestion"
 * semester. Mixes fully-graded, partially-graded, and single-grade modules
 * so every module status (validé, compensé, rattrapage, éliminé, pending)
 * can be demonstrated out of the box.
 */
export const mockSemester: SemesterData = {
  id: 'sem-3-fsjes-demo',
  title: 'Semestre 3 — Économie & Gestion',
  settings: DEFAULT_SETTINGS,
  modules: [
    {
      id: 'mod-micro',
      code: 'ECO301',
      name: 'Microéconomie II',
      coefficient: 4,
      elements: [
        { id: 'micro-td', name: 'Contrôle Continu / TD', weight: 30, score: 13.5 },
        { id: 'micro-exam', name: 'Examen Final', weight: 70, score: 11 },
      ],
    },
    {
      id: 'mod-compta',
      code: 'GES302',
      name: 'Comptabilité Analytique',
      coefficient: 3,
      elements: [
        { id: 'compta-td', name: 'Contrôle Continu / TD', weight: 25, score: 9 },
        { id: 'compta-exam', name: 'Examen Final', weight: 75, score: null },
      ],
    },
    {
      id: 'mod-stats',
      code: 'MTH303',
      name: 'Statistiques Inférentielles',
      coefficient: 3,
      elements: [
        { id: 'stats-td', name: 'Contrôle Continu / TD', weight: 30, score: 6 },
        { id: 'stats-exam', name: 'Examen Final', weight: 70, score: 4.5 },
      ],
    },
    {
      id: 'mod-droit',
      code: 'DRT304',
      name: 'Droit des Sociétés',
      coefficient: 2,
      elements: [{ id: 'droit-exam', name: 'Examen Final', weight: 100, score: 12.5 }],
    },
    {
      id: 'mod-marketing',
      code: 'GES305',
      name: 'Marketing Fondamental',
      coefficient: 3,
      elements: [
        { id: 'mkt-td', name: 'Contrôle Continu / TD', weight: 40, score: 15 },
        { id: 'mkt-exam', name: 'Examen Final', weight: 60, score: 8.5 },
      ],
    },
    {
      id: 'mod-anglais',
      code: 'LNG306',
      name: 'Anglais des Affaires',
      coefficient: 1,
      elements: [{ id: 'ang-exam', name: 'Examen Final', weight: 100, score: null }],
    },
  ],
};

/** Blank starting point for the "General University / Custom" preset. */
export function createBlankSemester(title = 'Nouveau semestre'): SemesterData {
  return {
    id: `sem-${Date.now()}`,
    title,
    settings: DEFAULT_SETTINGS,
    modules: [],
  };
}
