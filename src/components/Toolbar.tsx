import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  Check,
  ChevronDown,
  Download,
  FileImage,
  FileText,
  LayoutTemplate,
  Loader2,
  RotateCcw,
  Scale,
} from 'lucide-react';
import type { FacultyPreset, SemesterSettings, SemesterTemplate } from '../types';
import { facultyPresets } from '../data/facultyPresets';
import { semesterTemplates } from '../data/templates';

export type ExportKind = 'png' | 'pdf';

const templateOptions = semesterTemplates.map((template) => ({
  id: template.id,
  name: template.name,
  description: template.description,
  template,
}));

const presetOptions = facultyPresets.map((preset) => ({
  id: preset.id,
  name: preset.name,
  description: preset.description,
  preset,
}));

interface ToolbarProps {
  settings: SemesterSettings;
  currentPresetId: string | null;
  savedAt: number | null;
  exportKind: ExportKind | null;
  exportError: boolean;
  onApplyTemplate: (template: SemesterTemplate) => void;
  onApplyPreset: (preset: FacultyPreset) => void;
  onReset: () => void;
  onExport: (kind: ExportKind) => void;
}

interface MenuProps<T extends { id: string; name: string; description?: string }> {
  label: string;
  icon: ReactNode;
  options: T[];
  activeId: string | null;
  onSelect: (option: T) => void;
}

function Menu<T extends { id: string; name: string; description?: string }>({
  label,
  icon,
  options,
  activeId,
  onSelect,
}: MenuProps<T>) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors"
        style={{ borderColor: 'var(--border)', color: 'var(--fg)' }}
      >
        {icon}
        {label}
        <ChevronDown
          size={14}
          style={{ color: 'var(--fg-muted)' }}
          className={open ? 'rotate-180 transition-transform' : 'transition-transform'}
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute left-0 z-20 mt-2 max-h-80 w-72 overflow-y-auto rounded-xl border p-1.5 shadow-lg"
          style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-panel)' }}
        >
          {options.map((option) => {
            const active = option.id === activeId;
            return (
              <button
                key={option.id}
                type="button"
                role="menuitem"
                onClick={() => {
                  onSelect(option);
                  setOpen(false);
                }}
                className="flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors"
                style={{ backgroundColor: active ? 'var(--bg-panel-dim)' : 'transparent' }}
              >
                <span className="mt-0.5 w-4 shrink-0">
                  {active && <Check size={14} style={{ color: 'var(--color-stamp)' }} />}
                </span>
                <span className="min-w-0">
                  <span
                    className="block text-sm font-medium"
                    style={{ color: 'var(--fg)' }}
                  >
                    {option.name}
                  </span>
                  {option.description && (
                    <span className="mt-0.5 block text-xs" style={{ color: 'var(--fg-muted)' }}>
                      {option.description}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ActionButton({
  onClick,
  disabled,
  children,
  title,
}: {
  onClick: () => void;
  disabled?: boolean;
  children: ReactNode;
  title: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors disabled:opacity-60"
      style={{ borderColor: 'var(--border)', color: 'var(--fg)' }}
    >
      {children}
    </button>
  );
}

export function Toolbar({
  settings,
  currentPresetId,
  savedAt,
  exportKind,
  exportError,
  onApplyTemplate,
  onApplyPreset,
  onReset,
  onExport,
}: ToolbarProps) {
  const savedLabel =
    savedAt === null
      ? null
      : new Date(savedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  const rulesLabel =
    (currentPresetId === null ? 'Réglages personnalisés · ' : '') +
    `validation ≥ ${settings.validationThreshold}/20 · ` +
    `éliminatoire < ${settings.eliminatoryThreshold}/20 · ` +
    `compensation ${settings.compensationAllowed ? 'oui' : 'non'}`;

  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border px-4 py-3.5 sm:px-5"
      style={{ borderColor: 'var(--border)', backgroundColor: 'var(--bg-panel)' }}
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <Menu
          label="Modèles"
          icon={<LayoutTemplate size={15} style={{ color: 'var(--fg-muted)' }} />}
          options={templateOptions}
          activeId={null}
          onSelect={(option) => onApplyTemplate(option.template)}
        />

        <Menu
          label="Règles de la faculté"
          icon={<Scale size={15} style={{ color: 'var(--fg-muted)' }} />}
          options={presetOptions}
          activeId={currentPresetId}
          onSelect={(option) => onApplyPreset(option.preset)}
        />

        <div className="ml-auto flex items-center gap-2.5">
          <ActionButton
            title="Exporter le tableau de bord en PNG"
            onClick={() => onExport('png')}
            disabled={exportKind !== null}
          >
            {exportKind === 'png' ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <FileImage size={15} style={{ color: 'var(--fg-muted)' }} />
            )}
            PNG
          </ActionButton>

          <ActionButton
            title="Exporter le tableau de bord en PDF"
            onClick={() => onExport('pdf')}
            disabled={exportKind !== null}
          >
            {exportKind === 'pdf' ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <FileText size={15} style={{ color: 'var(--fg-muted)' }} />
            )}
            PDF
          </ActionButton>

          <ActionButton title="Repartir du modèle de démonstration" onClick={onReset}>
            <RotateCcw size={15} style={{ color: 'var(--fg-muted)' }} />
            Réinitialiser
          </ActionButton>
        </div>
      </div>

      <div
        className="flex flex-wrap items-center justify-between gap-2 text-xs"
        style={{ color: 'var(--fg-muted)' }}
      >
        <span>{rulesLabel}</span>
        <span className="inline-flex items-center gap-1.5">
          {exportError && (
            <span style={{ color: 'var(--color-rattrapage)' }}>
              Export impossible — réessayez.
            </span>
          )}
          {savedLabel !== null ? (
            <>
              <Download size={12} />
              Enregistré à {savedLabel}
            </>
          ) : (
            <>
              <Download size={12} />
              Sauvegarde automatique locale
            </>
          )}
        </span>
      </div>
    </div>
  );
}
