import { useCallback, useMemo, useRef, useState } from 'react';
import { mockSemester } from './data/mockData';
import { getTemplate } from './data/templates';
import { getPreset, matchPresetId } from './data/facultyPresets';
import { usePersistedSemester } from './hooks/usePersistedSemester';
import { exportBaseName } from './utils/filename';
import { Toolbar, type ExportKind } from './components/Toolbar';
import { SemesterHero } from './components/SemesterHero';
import { ModuleGrid } from './components/ModuleGrid';
import type { FacultyPreset, SemesterTemplate } from './types';

const DEMO_TEMPLATE_ID = 'demo-fsjes';

export default function App() {
  const { semester, setSemester, savedAt, resetSemester } = usePersistedSemester(
    () => mockSemester,
  );
  const [exportKind, setExportKind] = useState<ExportKind | null>(null);
  const [exportError, setExportError] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const currentPresetId = useMemo(() => matchPresetId(semester.settings), [semester.settings]);

  const handleScoreChange = useCallback(
    (moduleId: string, elementId: string, score: number | null) => {
      setSemester((prev) => ({
        ...prev,
        modules: prev.modules.map((m) =>
          m.id !== moduleId
            ? m
            : {
                ...m,
                elements: m.elements.map((el) => (el.id === elementId ? { ...el, score } : el)),
              },
        ),
      }));
    },
    [setSemester],
  );

  const handleWeightChange = useCallback(
    (moduleId: string, elementId: string, weight: number) => {
      setSemester((prev) => ({
        ...prev,
        modules: prev.modules.map((m) =>
          m.id !== moduleId
            ? m
            : {
                ...m,
                elements: m.elements.map((el) => (el.id === elementId ? { ...el, weight } : el)),
              },
        ),
      }));
    },
    [setSemester],
  );

  const applyTemplate = useCallback(
    (template: SemesterTemplate) => {
      if (
        semester.modules.length > 0 &&
        !window.confirm(`Remplacer « ${semester.title} » par le modèle « ${template.name} » ?`)
      ) {
        return;
      }
      const next = template.build();
      const preset = getPreset(template.presetId);
      setSemester(preset ? { ...next, settings: preset.settings } : next);
    },
    [semester.modules.length, semester.title, setSemester],
  );

  const applyPreset = useCallback(
    (preset: FacultyPreset) => {
      setSemester((prev) => ({ ...prev, settings: preset.settings }));
    },
    [setSemester],
  );

  const handleReset = useCallback(() => {
    if (!window.confirm('Effacer les notes saisies et repartir de la démonstration ?')) return;
    const template = getTemplate(DEMO_TEMPLATE_ID);
    resetSemester(template ? template.build() : mockSemester);
  }, [resetSemester]);

  const handleExport = useCallback(
    async (kind: ExportKind) => {
      const node = dashboardRef.current;
      if (!node || exportKind !== null) return;
      setExportKind(kind);
      setExportError(false);
      try {
        const { exportDashboardPdf, exportDashboardPng } = await import('./utils/exportImage');
        const base = exportBaseName(semester.title);
        if (kind === 'png') {
          await exportDashboardPng(node, base);
        } else {
          await exportDashboardPdf(node, base);
        }
      } catch (error) {
        console.error('Export impossible', error);
        setExportError(true);
      } finally {
        setExportKind(null);
      }
    },
    [exportKind, semester.title],
  );

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-10 sm:px-6">
      <Toolbar
        settings={semester.settings}
        currentPresetId={currentPresetId}
        savedAt={savedAt}
        exportKind={exportKind}
        exportError={exportError}
        onApplyTemplate={applyTemplate}
        onApplyPreset={applyPreset}
        onReset={handleReset}
        onExport={handleExport}
      />

      <div ref={dashboardRef} className="mt-6">
        <SemesterHero semester={semester} />

        <ModuleGrid
          semester={semester}
          onScoreChange={handleScoreChange}
          onWeightChange={handleWeightChange}
        />
      </div>
    </div>
  );
}
