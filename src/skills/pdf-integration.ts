/* ============================================
   PDF SKILL INTEGRATION
   PDF report generation
   ============================================ */

import { getSkillBridge, type SkillResult, type ProgressCallback } from './bridge';
import type { Sak, NielsenMetric, PodcastMetric } from '../types';

export interface PdfGenerationOptions {
  title?: string;
  subtitle?: string;
  author?: string;
  includeTimestamp?: boolean;
  pageSize?: 'A4' | 'Letter' | 'Legal';
  orientation?: 'portrait' | 'landscape';
  includeCharts?: boolean;
}

export interface WeeklySummaryData {
  weekNumber: number;
  year: number;
  period: string;
  nielsenStats: NielsenMetric[];
  podcastStats: PodcastMetric[];
  topSaker: Sak[];
  highlights: string[];
}

const DEFAULT_OPTIONS: PdfGenerationOptions = {
  title: 'Mission Control Report',
  includeTimestamp: true,
  pageSize: 'A4',
  orientation: 'portrait',
  includeCharts: true
};

/**
 * Export stats to PDF report
 */
export async function exportStatsToPdf(
  nielsenData: NielsenMetric[],
  podcastData: PodcastMetric[],
  options: PdfGenerationOptions = {},
  onProgress?: ProgressCallback
): Promise<SkillResult<{ pdfPath: string }>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const bridge = getSkillBridge();

  // Calculate summary statistics
  const nielsenSummary = calculateNielsenSummary(nielsenData);
  const podcastSummary = calculatePodcastSummary(podcastData);

  const reportData = {
    title: opts.title || 'Statistikkrapport',
    subtitle: opts.subtitle,
    author: opts.author,
    timestamp: opts.includeTimestamp ? new Date().toISOString() : undefined,
    pageSize: opts.pageSize,
    orientation: opts.orientation,
    includeCharts: opts.includeCharts,
    content: {
      type: 'stats-report',
      nielsen: {
        data: nielsenData,
        summary: nielsenSummary
      },
      podcast: {
        data: podcastData,
        summary: podcastSummary
      }
    }
  };

  return bridge.execute(
    'pdf',
    {
      action: 'generate',
      format: 'pdf',
      data: reportData,
      outputName: `stats-report-${new Date().toISOString().split('T')[0]}`
    },
    onProgress
  );
}

/**
 * Generate weekly summary PDF
 */
export async function generateWeeklySummary(
  data: WeeklySummaryData,
  options: PdfGenerationOptions = {},
  onProgress?: ProgressCallback
): Promise<SkillResult<{ pdfPath: string }>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const bridge = getSkillBridge();

  const reportData = {
    title: opts.title || `Ukesoppsummering - Uke ${data.weekNumber}`,
    subtitle: `${data.period} | ${data.year}`,
    author: opts.author || 'Mission Control',
    timestamp: opts.includeTimestamp ? new Date().toISOString() : undefined,
    pageSize: opts.pageSize,
    orientation: opts.orientation,
    includeCharts: opts.includeCharts,
    content: {
      type: 'weekly-summary',
      weekNumber: data.weekNumber,
      year: data.year,
      period: data.period,
      highlights: data.highlights,
      nielsenStats: data.nielsenStats,
      podcastStats: data.podcastStats,
      topSaker: data.topSaker
    }
  };

  return bridge.execute(
    'pdf',
    {
      action: 'generate',
      format: 'pdf',
      data: reportData,
      outputName: `weekly-summary-uke${data.weekNumber}-${data.year}`
    },
    onProgress
  );
}

/**
 * Generate printable saksliste PDF
 */
export async function generatePrintableSaksliste(
  saker: Sak[],
  options: PdfGenerationOptions = {},
  onProgress?: ProgressCallback
): Promise<SkillResult<{ pdfPath: string }>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const bridge = getSkillBridge();

  const reportData = {
    title: opts.title || 'Saksliste',
    subtitle: opts.subtitle || `NRJ Morgen | ${new Date().toLocaleDateString('nb-NO')}`,
    author: opts.author,
    timestamp: opts.includeTimestamp ? new Date().toISOString() : undefined,
    pageSize: opts.pageSize,
    orientation: opts.orientation,
    content: {
      type: 'saksliste',
      items: saker.map((sak) => ({
        title: sak.title,
        description: sak.description,
        category: sak.category,
        link: sak.link_url,
        showDate: sak.show_date
      })),
      categoryCounts: getCategoryCounts(saker)
    }
  };

  return bridge.execute(
    'pdf',
    {
      action: 'generate',
      format: 'pdf',
      data: reportData,
      outputName: `saksliste-${new Date().toISOString().split('T')[0]}`
    },
    onProgress
  );
}

/**
 * Generate chart PDF
 */
export async function generateChartPdf(
  chartData: Array<{ label: string; value: number; color?: string }>,
  chartType: 'bar' | 'line' | 'pie',
  title: string,
  options: PdfGenerationOptions = {},
  onProgress?: ProgressCallback
): Promise<SkillResult<{ pdfPath: string }>> {
  const opts = { ...DEFAULT_OPTIONS, ...options, orientation: 'landscape' };
  const bridge = getSkillBridge();

  const reportData = {
    title,
    subtitle: opts.subtitle,
    author: opts.author,
    timestamp: opts.includeTimestamp ? new Date().toISOString() : undefined,
    pageSize: opts.pageSize,
    orientation: opts.orientation,
    content: {
      type: 'chart',
      chartType,
      data: chartData
    }
  };

  return bridge.execute(
    'pdf',
    {
      action: 'generate',
      format: 'pdf',
      data: reportData,
      outputName: `chart-${chartType}-${Date.now()}`
    },
    onProgress
  );
}

// Helper functions
function calculateNielsenSummary(data: NielsenMetric[]) {
  if (data.length === 0) {
    return { total: 0, average: 0, max: 0, min: 0 };
  }

  const values = data.map((d) => d.value);
  const total = values.reduce((a, b) => a + b, 0);
  const average = total / values.length;
  const max = Math.max(...values);
  const min = Math.min(...values);

  return { total, average, max, min };
}

function calculatePodcastSummary(data: PodcastMetric[]) {
  if (data.length === 0) {
    return { total: 0, averageRank: 0, topRanked: null };
  }

  const total = data.length;
  const averageRank = data.reduce((sum, d) => sum + d.rank, 0) / total;
  const topRanked = data.reduce((best, current) => 
    current.rank < best.rank ? current : best
  );

  return { total, averageRank, topRanked };
}

function getCategoryCounts(saker: Sak[]): Record<string, number> {
  return saker.reduce((acc, sak) => {
    acc[sak.category] = (acc[sak.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
}

/**
 * Preview PDF as data URL (for in-app preview)
 */
export async function previewPdf(
  content: string | HTMLElement,
  options: PdfGenerationOptions = {}
): Promise<string> {
  // In a real implementation, this would use a library like pdfmake or jsPDF
  // to generate a preview data URL
  
  // For now, return a placeholder
  return 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO...';
}

/**
 * Get PDF generation status
 */
export function getPdfStatus(): { available: boolean; message: string } {
  const hasPdfLib = typeof window !== 'undefined' && 'pdfMake' in window;
  
  return {
    available: hasPdfLib,
    message: hasPdfLib 
      ? 'PDF generation ready' 
      : 'PDF library not loaded. Some features may be unavailable.'
  };
}

// Export all functions
export default {
  exportStatsToPdf,
  generateWeeklySummary,
  generatePrintableSaksliste,
  generateChartPdf,
  previewPdf,
  getPdfStatus
};
