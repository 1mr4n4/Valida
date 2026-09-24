import type { SemesterData, SemesterTemplate, UniversityModule } from '../types';
import { createBlankSemester, mockSemester } from './mockData';

/** Deep copy so every loaded session starts from an independent object graph. */
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function module(
  id: string,
  code: string,
  name: string,
  coefficient: number,
  elements: UniversityModule['elements'],
): UniversityModule {
  return { id, code, name, coefficient, elements };
}

function semester(
  id: string,
  title: string,
  modules: UniversityModule[],
): SemesterData {
  return {
    id,
    title,
    settings: {
      validationThreshold: 10,
      eliminatoryThreshold: 5,
      compensationAllowed: true,
      systemScale: 20,
    },
    modules,
  };
}

const sciencesSemester = semester('tpl-sciences-s1', 'Semestre 1 — Sciences fondamentales', [
  module('sc-math', 'MAT101', 'Mathématiques générales', 4, [
    { id: 'sc-math-td', name: 'Contrôle Continu / TD', weight: 30, score: 12 },
    { id: 'sc-math-exam', name: 'Examen Final', weight: 70, score: null },
  ]),
  module('sc-phys', 'PHI102', 'Physique', 3, [
    { id: 'sc-phys-tp', name: 'Travaux Pratiques', weight: 25, score: 14 },
    { id: 'sc-phys-exam', name: 'Examen Final', weight: 75, score: null },
  ]),
  module('sc-info', 'INF103', 'Algorithmique', 3, [
    { id: 'sc-info-tp', name: 'Projet', weight: 40, score: 16.5 },
    { id: 'sc-info-exam', name: 'Examen Final', weight: 60, score: 9 },
  ]),
  module('sc-chim', 'CHI104', 'Chimie générale', 2, [
    { id: 'sc-chim-td', name: 'Contrôle Continu / TD', weight: 30, score: null },
    { id: 'sc-chim-exam', name: 'Examen Final', weight: 70, score: null },
  ]),
  module('sc-comm', 'COM105', 'Techniques de communication', 2, [
    { id: 'sc-comm-exam', name: 'Examen Final', weight: 100, score: 13 },
  ]),
  module('sc-lang', 'LNG106', 'Anglais scientifique', 1, [
    { id: 'sc-lang-exam', name: 'Examen Final', weight: 100, score: null },
  ]),
]);

const droitSemester = semester('tpl-droit-s1', 'Semestre 1 — Droit', [
  module('dr-const', 'DRO101', 'Droit constitutionnel', 4, [
    { id: 'dr-const-cc', name: 'Contrôle Continu', weight: 40, score: 11.5 },
    { id: 'dr-const-exam', name: 'Examen Final', weight: 60, score: null },
  ]),
  module('dr-admin', 'DRO102', 'Droit administratif', 3, [
    { id: 'dr-admin-cc', name: 'Contrôle Continu', weight: 40, score: 8 },
    { id: 'dr-admin-exam', name: 'Examen Final', weight: 60, score: null },
  ]),
  module('dr-civil', 'DRO103', 'Droit civil — obligations', 3, [
    { id: 'dr-civil-exam', name: 'Examen Final', weight: 100, score: null },
  ]),
  module('dr-hist', 'DRO104', 'Histoire du droit', 2, [
    { id: 'dr-hist-cc', name: 'Contrôle Continu', weight: 30, score: 15 },
    { id: 'dr-hist-exam', name: 'Examen Final', weight: 70, score: 12 },
  ]),
  module('dr-meth', 'DRO105', 'Méthodologie juridique', 2, [
    { id: 'dr-meth-tp', name: 'Travaux Pratiques', weight: 50, score: 9.5 },
    { id: 'dr-meth-exam', name: 'Examen Final', weight: 50, score: null },
  ]),
  module('dr-lang', 'LNG107', 'Anglais juridique', 1, [
    { id: 'dr-lang-exam', name: 'Examen Final', weight: 100, score: 14 },
  ]),
]);

export const semesterTemplates: SemesterTemplate[] = [
  {
    id: 'demo-fsjes',
    name: 'Économie & Gestion (S3)',
    description: 'Six modules mixtes — la démonstration complète des statuts.',
    presetId: 'standard',
    build: () => clone(mockSemester),
  },
  {
    id: 'sciences-s1',
    name: 'Sciences fondamentales (S1)',
    description: 'Maths, physique, chimie, algo — plusieurs notes encore à venir.',
    presetId: 'standard',
    build: () => clone(sciencesSemester),
  },
  {
    id: 'droit-s1',
    name: 'Droit (S1)',
    description: 'Six matières juridiques, coefficients 1 à 4.',
    presetId: 'seuil-7',
    build: () => clone(droitSemester),
  },
  {
    id: 'blank',
    name: 'Semestre vide',
    description: 'Partir de zéro et construire sa propre structure.',
    presetId: 'standard',
    build: () => createBlankSemester(),
  },
];

export function getTemplate(id: string): SemesterTemplate | undefined {
  return semesterTemplates.find((t) => t.id === id);
}
