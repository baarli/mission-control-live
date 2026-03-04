/* ============================================
   TRANSCRIBE SKILL INTEGRATION
   Audio transcription with diarization
   ============================================ */

import type { Sak } from '../types';

import { getSkillBridge, type SkillResult, type ProgressCallback } from './bridge';

export interface TranscriptionOptions {
  model?: 'gpt-4o-mini-transcribe' | 'gpt-4o-transcribe' | 'gpt-4o-transcribe-diarize';
  responseFormat?: 'text' | 'json' | 'diarized_json';
  language?: string;
  chunkingStrategy?: 'auto' | 'none';
  knownSpeakers?: Array<{ name: string; referenceAudioPath: string }>;
}

export interface TranscriptionResult {
  text: string;
  segments?: Array<{
    start: number;
    end: number;
    text: string;
    speaker?: string;
  }>;
  speakers?: string[];
  duration?: number;
}

export interface LinkedTranscription {
  id: string;
  sakId: string;
  audioPath: string;
  transcriptPath: string;
  transcription: TranscriptionResult;
  createdAt: string;
}

const DEFAULT_OPTIONS: TranscriptionOptions = {
  model: 'gpt-4o-mini-transcribe',
  responseFormat: 'text',
  chunkingStrategy: 'auto'
};

/**
 * Upload audio for transcription
 */
export async function transcribeAudio(
  audioFile: File | string,
  options: TranscriptionOptions = {},
  onProgress?: ProgressCallback
): Promise<SkillResult<TranscriptionResult>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const bridge = getSkillBridge();

  // Check environment
  const envCheck = bridge.checkEnvironment('transcribe');
  if (!envCheck.ready) {
    return {
      success: false,
      error: `Missing environment variables: ${envCheck.missing.join(', ')}`,
      logs: ['Environment check failed']
    };
  }

  const isFile = audioFile instanceof File;
  const filePath = isFile ? await uploadTempFile(audioFile) : audioFile;

  const args: Record<string, unknown> = {
    action: 'transcribe',
    audioPath: filePath,
    model: opts.model,
    responseFormat: opts.responseFormat,
    chunkingStrategy: opts.chunkingStrategy
  };

  if (opts.language) {
    args.language = opts.language;
  }

  if (opts.knownSpeakers && opts.knownSpeakers.length > 0) {
    args.knownSpeakers = opts.knownSpeakers;
  }

  const result = await bridge.execute<TranscriptionResult>(
    'transcribe',
    args,
    onProgress
  );

  // Clean up temp file if we created one
  if (isFile) {
    await cleanupTempFile(filePath);
  }

  return result;
}

/**
 * Transcribe with speaker diarization
 */
export async function transcribeWithDiarization(
  audioFile: File | string,
  knownSpeakers?: Array<{ name: string; referenceAudioPath: string }>,
  onProgress?: ProgressCallback
): Promise<SkillResult<TranscriptionResult>> {
  return transcribeAudio(
    audioFile,
    {
      model: 'gpt-4o-transcribe-diarize',
      responseFormat: 'diarized_json',
      knownSpeakers
    },
    onProgress
  );
}

/**
 * Link transcription to agenda item
 */
export async function linkTranscriptionToSak(
  transcriptionResult: TranscriptionResult,
  sak: Sak,
  audioPath: string,
  options: { saveToStorage?: boolean } = {}
): Promise<SkillResult<LinkedTranscription>> {
  const linkedTranscription: LinkedTranscription = {
    id: crypto.randomUUID(),
    sakId: sak.id,
    audioPath,
    transcriptPath: `${audioPath}.transcript.json`,
    transcription: transcriptionResult,
    createdAt: new Date().toISOString()
  };

  // Save to localStorage for persistence
  if (options.saveToStorage !== false) {
    saveTranscriptionToStorage(linkedTranscription);
  }

  return {
    success: true,
    data: linkedTranscription,
    outputPath: linkedTranscription.transcriptPath,
    logs: [`Transcription linked to sak ${sak.id}`]
  };
}

/**
 * Get transcriptions linked to a sak
 */
export function getTranscriptionsForSak(sakId: string): LinkedTranscription[] {
  const allTranscriptions = getAllTranscriptionsFromStorage();
  return allTranscriptions.filter((t) => t.sakId === sakId);
}

/**
 * Get all stored transcriptions
 */
export function getAllTranscriptions(): LinkedTranscription[] {
  return getAllTranscriptionsFromStorage();
}

/**
 * Delete a transcription
 */
export function deleteTranscription(transcriptionId: string): boolean {
  try {
    const allTranscriptions = getAllTranscriptionsFromStorage();
    const filtered = allTranscriptions.filter((t) => t.id !== transcriptionId);
    localStorage.setItem('mc-transcriptions', JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

/**
 * Extract quotes from transcription
 */
export function extractQuotes(
  transcription: TranscriptionResult,
  options: { minLength?: number; maxLength?: number; speaker?: string } = {}
): string[] {
  const { minLength = 20, maxLength = 200, speaker } = options;

  if (!transcription.segments) {
    // Split text into sentences as fallback
    return transcription.text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= minLength && s.length <= maxLength);
  }

  return transcription.segments
    .filter((segment) => !speaker || segment.speaker === speaker)
    .map((segment) => segment.text.trim())
    .filter((text) => text.length >= minLength && text.length <= maxLength);
}

/**
 * Search within transcription
 */
export function searchTranscription(
  transcription: TranscriptionResult,
  query: string
): Array<{ text: string; timestamp?: number; speaker?: string }> {
  const results: Array<{ text: string; timestamp?: number; speaker?: string }> = [];
  const queryLower = query.toLowerCase();

  if (transcription.segments) {
    for (const segment of transcription.segments) {
      if (segment.text.toLowerCase().includes(queryLower)) {
        results.push({
          text: segment.text,
          timestamp: segment.start,
          speaker: segment.speaker
        });
      }
    }
  } else if (transcription.text.toLowerCase().includes(queryLower)) {
    results.push({ text: transcription.text });
  }

  return results;
}

/**
 * Get supported audio formats
 */
export function getSupportedAudioFormats(): string[] {
  return ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm', 'ogg', 'oga'];
}

/**
 * Validate audio file
 */
export function validateAudioFile(file: File): { valid: boolean; error?: string } {
  const supportedFormats = getSupportedAudioFormats();
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (!extension || !supportedFormats.includes(extension)) {
    return {
      valid: false,
      error: `Unsupported format: ${extension}. Supported: ${supportedFormats.join(', ')}`
    };
  }

  // Max 100MB (OpenAI limit for some models)
  const maxSize = 100 * 1024 * 1024;
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 100MB`
    };
  }

  return { valid: true };
}

// Storage helpers
const STORAGE_KEY = 'mc-transcriptions';

function saveTranscriptionToStorage(transcription: LinkedTranscription): void {
  try {
    const existing = getAllTranscriptionsFromStorage();
    existing.push(transcription);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (error) {
    console.error('Failed to save transcription:', error);
  }
}

function getAllTranscriptionsFromStorage(): LinkedTranscription[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// File handling helpers (mock implementations)
async function uploadTempFile(file: File): Promise<string> {
  // In a real implementation, this would upload to a temp storage
  // and return the path
  return `tmp/${file.name}`;
}

async function cleanupTempFile(path: string): Promise<void> {
  // In a real implementation, this would delete the temp file
  console.log('Cleaning up:', path);
}

// Export all functions
export default {
  transcribeAudio,
  transcribeWithDiarization,
  linkTranscriptionToSak,
  getTranscriptionsForSak,
  getAllTranscriptions,
  deleteTranscription,
  extractQuotes,
  searchTranscription,
  getSupportedAudioFormats,
  validateAudioFile
};
