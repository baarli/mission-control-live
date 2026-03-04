/* ============================================
   DOC SKILL INTEGRATION
   .docx document generation
   ============================================ */

import { getSkillBridge, type SkillResult, type ProgressCallback } from './bridge';
import type { Sak } from '../types';

export interface DocGenerationOptions {
  title?: string;
  subtitle?: string;
  author?: string;
  includeTimestamp?: boolean;
  template?: 'default' | 'briefing' | 'meeting' | 'report';
}

export interface DailyBriefingData {
  date: string;
  weather?: string;
  topStories: Array<{
    title: string;
    summary: string;
    source?: string;
  }>;
  showNotes: string[];
  reminders: string[];
}

export interface MeetingAgendaData {
  title: string;
  date: string;
  attendees: string[];
  agendaItems: Array<{
    time: string;
    topic: string;
    owner?: string;
    duration?: number;
  }>;
  saker: Sak[];
}

const DEFAULT_OPTIONS: DocGenerationOptions = {
  title: 'Mission Control Document',
  includeTimestamp: true,
  template: 'default'
};

/**
 * Generate a .docx document from saksliste
 */
export async function exportSakslisteToDocx(
  saker: Sak[],
  options: DocGenerationOptions = {},
  onProgress?: ProgressCallback
): Promise<SkillResult<{ documentPath: string }>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const bridge = getSkillBridge();

  // Check environment
  const envCheck = bridge.checkEnvironment('doc');
  if (!envCheck.ready) {
    return {
      success: false,
      error: `Missing environment variables: ${envCheck.missing.join(', ')}`,
      logs: ['Environment check failed']
    };
  }

  // Prepare document data
  const docData = {
    title: opts.title,
    subtitle: opts.subtitle,
    author: opts.author,
    timestamp: opts.includeTimestamp ? new Date().toISOString() : undefined,
    template: opts.template,
    content: {
      type: 'saksliste',
      items: saker.map((sak) => ({
        title: sak.title,
        description: sak.description,
        category: sak.category,
        link: sak.link_url,
        showDate: sak.show_date
      }))
    }
  };

  return bridge.execute(
    'doc',
    {
      action: 'generate',
      format: 'docx',
      data: docData,
      outputName: `saksliste-${new Date().toISOString().split('T')[0]}`
    },
    onProgress
  );
}

/**
 * Generate daily briefing document
 */
export async function generateDailyBriefing(
  data: DailyBriefingData,
  options: DocGenerationOptions = {},
  onProgress?: ProgressCallback
): Promise<SkillResult<{ documentPath: string }>> {
  const opts = { ...DEFAULT_OPTIONS, ...options, template: 'briefing' };
  const bridge = getSkillBridge();

  const docData = {
    title: opts.title || `Dagsbriefing - ${data.date}`,
    subtitle: opts.subtitle || 'NRJ Morgen',
    author: opts.author,
    timestamp: opts.includeTimestamp ? new Date().toISOString() : undefined,
    template: 'briefing',
    content: {
      type: 'daily-briefing',
      date: data.date,
      weather: data.weather,
      topStories: data.topStories,
      showNotes: data.showNotes,
      reminders: data.reminders
    }
  };

  return bridge.execute(
    'doc',
    {
      action: 'generate',
      format: 'docx',
      data: docData,
      outputName: `briefing-${data.date}`
    },
    onProgress
  );
}

/**
 * Generate meeting agenda document
 */
export async function generateMeetingAgenda(
  data: MeetingAgendaData,
  options: DocGenerationOptions = {},
  onProgress?: ProgressCallback
): Promise<SkillResult<{ documentPath: string }>> {
  const opts = { ...DEFAULT_OPTIONS, ...options, template: 'meeting' };
  const bridge = getSkillBridge();

  const docData = {
    title: opts.title || data.title,
    subtitle: `Dato: ${data.date}`,
    author: opts.author,
    timestamp: opts.includeTimestamp ? new Date().toISOString() : undefined,
    template: 'meeting',
    content: {
      type: 'meeting-agenda',
      attendees: data.attendees,
      agendaItems: data.agendaItems,
      saker: data.saker.map((sak) => ({
        title: sak.title,
        category: sak.category,
        description: sak.description
      }))
    }
  };

  return bridge.execute(
    'doc',
    {
      action: 'generate',
      format: 'docx',
      data: docData,
      outputName: `agenda-${data.date}`
    },
    onProgress
  );
}

/**
 * Generate document from template
 */
export async function generateFromTemplate(
  templateName: string,
  variables: Record<string, unknown>,
  options: DocGenerationOptions = {},
  onProgress?: ProgressCallback
): Promise<SkillResult<{ documentPath: string }>> {
  const bridge = getSkillBridge();

  return bridge.execute(
    'doc',
    {
      action: 'generate-from-template',
      template: templateName,
      variables,
      options: { ...DEFAULT_OPTIONS, ...options }
    },
    onProgress
  );
}

/**
 * Get available document templates
 */
export function getAvailableTemplates(): string[] {
  return ['default', 'briefing', 'meeting', 'report', 'newsletter'];
}

/**
 * Preview document (returns HTML representation)
 */
export function previewDocument(
  saker: Sak[],
  options: DocGenerationOptions = {}
): string {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; }
        h1 { color: #dc2626; border-bottom: 2px solid #dc2626; padding-bottom: 10px; }
        h2 { color: #374151; margin-top: 30px; }
        .meta { color: #6b7280; font-size: 14px; margin-bottom: 30px; }
        .sak { margin: 20px 0; padding: 15px; background: #f9fafb; border-radius: 8px; }
        .sak-title { font-weight: bold; color: #111827; margin-bottom: 8px; }
        .sak-category { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 12px; font-weight: 600; }
        .category-TALK { background: #dbeafe; color: #1e40af; }
        .category-REALITY_TV { background: #fce7f3; color: #9d174d; }
        .category-KJENDIS_DRAMA { background: #fef3c7; color: #92400e; }
        .category-FILM_TV { background: #d1fae5; color: #065f46; }
        .category-MUSIKK { background: #e0e7ff; color: #3730a3; }
        .category-INTERNASJONALT { background: #f3e8ff; color: #6b21a8; }
        .sak-description { margin-top: 10px; color: #4b5563; }
        .sak-link { margin-top: 8px; font-size: 12px; }
        .sak-link a { color: #dc2626; }
      </style>
    </head>
    <body>
      <h1>${opts.title}</h1>
      <div class="meta">
        ${opts.subtitle ? `<div>${opts.subtitle}</div>` : ''}
        ${opts.author ? `<div>Av: ${opts.author}</div>` : ''}
        ${opts.includeTimestamp ? `<div>Generert: ${new Date().toLocaleString('nb-NO')}</div>` : ''}
      </div>
      
      <h2>Saker (${saker.length})</h2>
      ${saker.map((sak, index) => `
        <div class="sak">
          <div class="sak-title">${index + 1}. ${sak.title}</div>
          <span class="sak-category category-${sak.category}">${sak.category.replace('_', ' ')}</span>
          ${sak.description ? `<div class="sak-description">${sak.description}</div>` : ''}
          ${sak.link_url ? `<div class="sak-link"><a href="${sak.link_url}" target="_blank">${sak.link_url}</a></div>` : ''}
        </div>
      `).join('')}
    </body>
    </html>
  `;
  
  return html;
}

// Export all functions
export default {
  exportSakslisteToDocx,
  generateDailyBriefing,
  generateMeetingAgenda,
  generateFromTemplate,
  getAvailableTemplates,
  previewDocument
};
