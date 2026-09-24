import { useState } from 'react';
import { mockSemester } from './data/mockData';
import type { SemesterData } from './types';
import { SemesterHero } from './components/SemesterHero';
import { ModuleGrid } from './components/ModuleGrid';

export default function App() {
  const [semester, setSemester] = useState<SemesterData>(mockSemester);

  function handleScoreChange(moduleId: string, elementId: string, score: number | null) {
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
  }

  function handleWeightChange(moduleId: string, elementId: string, weight: number) {
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
  }

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-4 py-10 sm:px-6">
      <SemesterHero semester={semester} />

      <ModuleGrid
        semester={semester}
        onScoreChange={handleScoreChange}
        onWeightChange={handleWeightChange}
      />

      {/* Step 4 (templates, faculty presets, persistence, PNG/PDF export)
          attaches below this line. */}
    </div>
  );
}
