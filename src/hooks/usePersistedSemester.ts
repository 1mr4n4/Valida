import { useCallback, useEffect, useState } from 'react';
import type { GradeElement, SemesterData, SemesterSettings, UniversityModule } from '../types';

const STORAGE_KEY = 'valida-semester';
const SCHEMA_VERSION = 1;
const SAVE_DELAY_MS = 400;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isScore(value: unknown): value is number | null {
  return value === null || (isFiniteNumber(value) && value >= 0 && value <= 20);
}

function sanitizeSettings(value: unknown): SemesterSettings | null {
  if (typeof value !== 'object' || value === null) return null;
  const s = value as Partial<SemesterSettings>;
  if (!isFiniteNumber(s.validationThreshold) || !isFiniteNumber(s.eliminatoryThreshold)) {
    return null;
  }
  if (typeof s.compensationAllowed !== 'boolean') return null;
  return {
    validationThreshold: s.validationThreshold,
    eliminatoryThreshold: s.eliminatoryThreshold,
    compensationAllowed: s.compensationAllowed,
    systemScale: 20,
  };
}

function sanitizeElements(value: unknown): GradeElement[] | null {
  if (!Array.isArray(value)) return null;
  const elements: GradeElement[] = [];
  for (const raw of value) {
    if (typeof raw !== 'object' || raw === null) return null;
    const el = raw as Partial<GradeElement>;
    if (typeof el.id !== 'string' || typeof el.name !== 'string') return null;
    if (!isFiniteNumber(el.weight) || el.weight < 0) return null;
    if (!isScore(el.score)) return null;
    elements.push({ id: el.id, name: el.name, weight: el.weight, score: el.score });
  }
  return elements;
}

function sanitizeModules(value: unknown): UniversityModule[] | null {
  if (!Array.isArray(value)) return null;
  const modules: UniversityModule[] = [];
  for (const raw of value) {
    if (typeof raw !== 'object' || raw === null) return null;
    const m = raw as Partial<UniversityModule>;
    if (typeof m.id !== 'string' || typeof m.name !== 'string') return null;
    if (m.code !== undefined && typeof m.code !== 'string') return null;
    if (!isFiniteNumber(m.coefficient) || m.coefficient < 0) return null;
    const elements = sanitizeElements(m.elements);
    if (!elements) return null;
    modules.push({
      id: m.id,
      code: m.code,
      name: m.name,
      coefficient: m.coefficient,
      elements,
      targetScore: isFiniteNumber(m.targetScore) ? m.targetScore : undefined,
    });
  }
  return modules;
}

/** Returns a validated semester from parsed storage, or null when unusable. */
function sanitizeSemester(raw: unknown): SemesterData | null {
  if (typeof raw !== 'object' || raw === null) return null;
  const envelope = raw as { version?: unknown; semester?: unknown };
  if (envelope.version !== SCHEMA_VERSION) return null;
  if (typeof envelope.semester !== 'object' || envelope.semester === null) return null;

  const s = envelope.semester as Partial<SemesterData>;
  if (typeof s.id !== 'string' || typeof s.title !== 'string') return null;
  const settings = sanitizeSettings(s.settings);
  const modules = sanitizeModules(s.modules);
  if (!settings || !modules) return null;

  return { id: s.id, title: s.title, settings, modules };
}

export function loadSemester(): SemesterData | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return sanitizeSemester(JSON.parse(raw));
  } catch {
    return null;
  }
}

function clearStoredSemester() {
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable — nothing to clear */
  }
}

/**
 * Semester state backed by localStorage: writes are debounced so dragging a
 * score slider does not hit storage on every frame, and every payload is
 * schema-validated on read so a stale or corrupted value can never crash boot.
 */
export function usePersistedSemester(createInitial: () => SemesterData) {
  const [semester, setSemester] = useState<SemesterData>(() => loadSemester() ?? createInitial());
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ version: SCHEMA_VERSION, savedAt: Date.now(), semester }),
        );
        setSavedAt(Date.now());
      } catch {
        /* quota exceeded or private mode — keep running in memory only */
      }
    }, SAVE_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [semester]);

  const resetSemester = useCallback((next: SemesterData) => {
    clearStoredSemester();
    setSemester(next);
    setSavedAt(null);
  }, []);

  return { semester, setSemester, savedAt, resetSemester };
}
