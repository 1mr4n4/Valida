import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

const PAGE = { width: 210, height: 297, margin: 10 } as const; // A4, millimetres

function pageBackground(): string {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  return value || '#f6f4ee';
}

async function renderNode(node: HTMLElement, pixelRatio: number): Promise<string> {
  return toPng(node, { pixelRatio, backgroundColor: pageBackground() });
}

function download(dataUrl: string, filename: string): void {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.rel = 'noopener';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  const image = new Image();
  image.src = dataUrl;
  return image.decode().then(() => image);
}

function sliceToJpeg(
  image: HTMLImageElement,
  sx: number,
  sy: number,
  sw: number,
  sh: number,
): string {
  const canvas = document.createElement('canvas');
  canvas.width = sw;
  canvas.height = sh;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('Canvas 2D indisponible');
  context.fillStyle = pageBackground();
  context.fillRect(0, 0, sw, sh);
  context.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
  return canvas.toDataURL('image/jpeg', 0.92);
}

/** Render the dashboard and trigger a PNG download (2× for crisp text). */
export async function exportDashboardPng(node: HTMLElement, filename: string): Promise<void> {
  download(await renderNode(node, 2), `${filename}.png`);
}

/**
 * Render the dashboard and build a paginated A4 PDF. The capture is sliced
 * page by page on a canvas (JPEG-encoded) so the file stays small and
 * nothing is cropped when the semester grows.
 */
export async function exportDashboardPdf(node: HTMLElement, filename: string): Promise<void> {
  const dataUrl = await renderNode(node, 2);
  const image = await loadImage(dataUrl);
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const usableWidth = PAGE.width - PAGE.margin * 2;
  const usableHeight = PAGE.height - PAGE.margin * 2;
  const scale = usableWidth / image.naturalWidth;
  const totalHeightMm = image.naturalHeight * scale;
  const isSinglePage = totalHeightMm <= usableHeight;
  const sliceHeight = Math.min(image.naturalHeight, Math.ceil(usableHeight / scale));

  let offset = 0;
  let pageIndex = 0;
  while (offset < image.naturalHeight) {
    const height = Math.min(sliceHeight, image.naturalHeight - offset);
    if (pageIndex > 0) pdf.addPage();
    pdf.addImage(
      sliceToJpeg(image, 0, offset, image.naturalWidth, height),
      'JPEG',
      PAGE.margin,
      isSinglePage ? PAGE.margin + (usableHeight - totalHeightMm) / 2 : PAGE.margin,
      usableWidth,
      height * scale,
    );
    offset += height;
    pageIndex += 1;
  }

  pdf.save(`${filename}.pdf`);
}
