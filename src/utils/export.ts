/* ============================================
   EXPORT UTILITIES
   CSV, JSON, and other export formats
   ============================================ */

import { getCategoryLabel } from '../constants/categories';
import type { Sak, SearchResult, NielsenMetric, PodcastMetric } from '../types';

import { formatDate } from './date';

/**
 * Export data to CSV
 */
export function exportToCsv(
  data: Record<string, unknown>[],
  options: {
    filename?: string;
    delimiter?: string;
    includeHeaders?: boolean;
  } = {}
): { success: boolean; blob?: Blob; error?: string } {
  const { 
    filename = 'export.csv', 
    delimiter = ';',
    includeHeaders = true 
  } = options;

  try {
    if (data.length === 0) {
      return { success: false, error: 'Ingen data å eksportere' };
    }

    const firstRow = data[0];
    if (!firstRow) {
      return { success: false, error: 'Ingen data å eksportere' };
    }

    const headers = Object.keys(firstRow);
    
    // Create CSV content
    let csv = '';
    
    // Add BOM for Excel UTF-8 compatibility
    csv += '\uFEFF';
    
    // Headers
    if (includeHeaders) {
      csv += headers.join(delimiter) + '\n';
    }
    
    // Rows
    for (const row of data) {
      const values = headers.map((header) => {
        const value = row[header];
        
        // Handle different value types
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') {
          // Escape quotes and wrap in quotes if contains delimiter or newline
          let escaped = value.replace(/"/g, '""');
          if (escaped.includes(delimiter) || escaped.includes('\n') || escaped.includes('"')) {
            escaped = `"${escaped}"`;
          }
          return escaped;
        }
        if (value instanceof Date) {
          return formatDate(value);
        }
        return String(value);
      });
      
      csv += values.join(delimiter) + '\n';
    }
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    downloadBlob(blob, filename);
    
    return { success: true, blob };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ukjent feil ved eksport' 
    };
  }
}

/**
 * Export saker to CSV
 */
export function exportSakerToCsv(
  saker: Sak[],
  filename?: string
): { success: boolean; error?: string } {
  const data = saker.map((sak) => ({
    Tittel: sak.title,
    Kategori: getCategoryLabel(sak.category),
    Beskrivelse: sak.description || '',
    'Show dato': formatDate(sak.show_date),
    Lenke: sak.link_url || '',
    'Opprettet': formatDate(sak.created_at)
  }));

  return exportToCsv(data, { 
    filename: filename || `saksliste-${formatDate(new Date())}.csv` 
  });
}

/**
 * Export search results to CSV
 */
export function exportSearchResultsToCsv(
  results: SearchResult[],
  filename?: string
): { success: boolean; error?: string } {
  const data = results.map((result) => ({
    Tittel: result.title,
    Beskrivelse: result.description,
    Kilde: result.source,
    Kategori: result.category ? getCategoryLabel(result.category) : '',
    URL: result.url,
    Publisert: result.published_at ? formatDate(result.published_at) : ''
  }));

  return exportToCsv(data, { 
    filename: filename || `sokeresultater-${formatDate(new Date())}.csv` 
  });
}

/**
 * Export data to JSON
 */
export function exportToJson(
  data: unknown,
  options: {
    filename?: string;
    indent?: number;
  } = {}
): { success: boolean; blob?: Blob; error?: string } {
  const { filename = 'export.json', indent = 2 } = options;

  try {
    const json = JSON.stringify(data, null, indent);
    const blob = new Blob([json], { type: 'application/json' });
    downloadBlob(blob, filename);
    
    return { success: true, blob };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ukjent feil ved eksport' 
    };
  }
}

/**
 * Export saker to JSON
 */
export function exportSakerToJson(
  saker: Sak[],
  filename?: string
): { success: boolean; error?: string } {
  const exportData = {
    exportedAt: new Date().toISOString(),
    count: saker.length,
    items: saker
  };

  return exportToJson(exportData, { 
    filename: filename || `saksliste-${formatDate(new Date())}.json` 
  });
}

/**
 * Export stats to JSON
 */
export function exportStatsToJson(
  nielsenData: NielsenMetric[],
  podcastData: PodcastMetric[],
  filename?: string
): { success: boolean; error?: string } {
  const exportData = {
    exportedAt: new Date().toISOString(),
    nielsen: {
      count: nielsenData.length,
      data: nielsenData
    },
    podcast: {
      count: podcastData.length,
      data: podcastData
    }
  };

  return exportToJson(exportData, { 
    filename: filename || `stats-${formatDate(new Date())}.json` 
  });
}

/**
 * Export to plain text
 */
export function exportToText(
  content: string,
  filename?: string
): { success: boolean; error?: string } {
  try {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    downloadBlob(blob, filename || 'export.txt');
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ukjent feil ved eksport' 
    };
  }
}

/**
 * Export saker to formatted text
 */
export function exportSakerToText(saker: Sak[]): { success: boolean; error?: string } {
  const lines = [
    'SAKSLISTE',
    '=========',
    `Generert: ${formatDate(new Date())}`,
    `Antall saker: ${saker.length}`,
    '',
    ...saker.map((sak, index) => [
      `${index + 1}. ${sak.title}`,
      `   Kategori: ${getCategoryLabel(sak.category)}`,
      sak.description ? `   Beskrivelse: ${sak.description}` : '',
      `   Show dato: ${formatDate(sak.show_date)}`,
      sak.link_url ? `   Lenke: ${sak.link_url}` : '',
      ''
    ].filter(Boolean).join('\n'))
  ];

  return exportToText(lines.join('\n'), `saksliste-${formatDate(new Date())}.txt`);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      return success;
    } catch {
      return false;
    }
  }
}

/**
 * Copy saker list to clipboard
 */
export async function copySakerToClipboard(saker: Sak[]): Promise<boolean> {
  const lines = saker.map((sak, index) => 
    `${index + 1}. ${sak.title} [${getCategoryLabel(sak.category)}]`
  );
  
  return copyToClipboard(lines.join('\n'));
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parse CSV file
 */
export function parseCsv(
  csvText: string,
  options: {
    delimiter?: string;
    hasHeaders?: boolean;
  } = {}
): { success: boolean; data?: Record<string, string>[]; error?: string } {
  const { delimiter = ';', hasHeaders = true } = options;

  try {
    const lines = csvText.split('\n').filter((line) => line.trim());
    
    if (lines.length === 0) {
      return { success: false, error: 'Filen er tom' };
    }

    let headers: string[] = [];
    const data: Record<string, string>[] = [];

    lines.forEach((line, index) => {
      // Simple CSV parsing (doesn't handle all edge cases)
      const values = line.split(delimiter).map((v) => v.trim().replace(/^"|"$/g, ''));

      if (index === 0 && hasHeaders) {
        headers = values;
      } else {
        const row: Record<string, string> = {};
        values.forEach((value, i) => {
          const key = hasHeaders ? headers[i] || `col${i}` : `col${i}`;
          row[key] = value;
        });
        data.push(row);
      }
    });

    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ukjent feil ved parsing' 
    };
  }
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
}

/**
 * Read file as JSON
 */
export async function readFileAsJson<T = unknown>(file: File): Promise<T> {
  const text = await readFileAsText(file);
  return JSON.parse(text) as T;
}

/**
 * Generate print-friendly HTML
 */
export function generatePrintHtml(
  title: string,
  content: string,
  options: {
    css?: string;
    header?: string;
    footer?: string;
  } = {}
): string {
  const { css = '', header = '', footer = '' } = options;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        @media print {
          body { font-family: Arial, sans-serif; margin: 20mm; }
          .no-print { display: none; }
          .page-break { page-break-after: always; }
        }
        body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
        h1 { color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px; }
        ${css}
      </style>
    </head>
    <body>
      ${header}
      <h1>${title}</h1>
      ${content}
      ${footer}
      <script>
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `;
}

/**
 * Print content
 */
export function printContent(
  title: string,
  content: string,
  options?: {
    css?: string;
    header?: string;
    footer?: string;
  }
): void {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const html = generatePrintHtml(title, content, options);
  printWindow.document.write(html);
  printWindow.document.close();
}

export default {
  exportToCsv,
  exportSakerToCsv,
  exportSearchResultsToCsv,
  exportToJson,
  exportSakerToJson,
  exportStatsToJson,
  exportToText,
  exportSakerToText,
  copyToClipboard,
  copySakerToClipboard,
  downloadBlob,
  parseCsv,
  readFileAsText,
  readFileAsJson,
  generatePrintHtml,
  printContent
};
