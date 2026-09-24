/** URL-safe, accent-free file name for downloaded exports. */
export function exportBaseName(semesterTitle: string): string {
  const slug = semesterTitle
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `valida-${slug || 'semestre'}`;
}
