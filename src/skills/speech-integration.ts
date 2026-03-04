/* ============================================
   SPEECH SKILL INTEGRATION
   Text-to-speech for audio briefings
   ============================================ */

import { getSkillBridge, type SkillResult, type ProgressCallback } from './bridge';
import type { Sak } from '../types';

export type SpeechVoice = 
  | 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer'  // TTS-1 voices
  | 'ash' | 'ballad' | 'coral' | 'sage' | 'verse'              // GPT-4o TTS voices
  | 'marin' | 'coral' | 'ember' | 'juniper' | 'marin';         // GPT-4o mini TTS voices

export type SpeechModel = 'tts-1' | 'tts-1-hd' | 'gpt-4o-mini-tts-2025-12-15';

export type SpeechFormat = 'mp3' | 'opus' | 'aac' | 'flac' | 'wav' | 'pcm';

export interface SpeechOptions {
  model?: SpeechModel;
  voice?: SpeechVoice;
  responseFormat?: SpeechFormat;
  speed?: number; // 0.25 to 4.0
  instructions?: string;
}

export interface AudioBriefing {
  id: string;
  title: string;
  audioPath: string;
  duration?: number;
  createdAt: string;
  items: Array<{
    type: 'intro' | 'sak' | 'outro';
    content: string;
    sakId?: string;
  }>;
}

export interface BatchSpeechJob {
  id: string;
  items: Array<{
    text: string;
    voice?: SpeechVoice;
    instructions?: string;
    outputPath: string;
  }>;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

const DEFAULT_OPTIONS: SpeechOptions = {
  model: 'gpt-4o-mini-tts-2025-12-15',
  voice: 'coral',
  responseFormat: 'mp3',
  speed: 1.0
};

/**
 * Convert text to speech
 */
export async function textToSpeech(
  text: string,
  options: SpeechOptions = {},
  onProgress?: ProgressCallback
): Promise<SkillResult<{ audioPath: string; duration?: number }>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const bridge = getSkillBridge();

  // Check environment
  const envCheck = bridge.checkEnvironment('speech');
  if (!envCheck.ready) {
    return {
      success: false,
      error: `Missing environment variables: ${envCheck.missing.join(', ')}`,
      logs: ['Environment check failed']
    };
  }

  // Validate input length (4096 char limit for mini TTS)
  if (text.length > 4096) {
    return {
      success: false,
      error: 'Text too long (maximum 4096 characters for GPT-4o mini TTS)',
      logs: ['Input validation failed']
    };
  }

  return bridge.execute(
    'speech',
    {
      action: 'generate',
      input: text,
      model: opts.model,
      voice: opts.voice,
      response_format: opts.responseFormat,
      speed: opts.speed,
      instructions: opts.instructions
    },
    onProgress
  );
}

/**
 * Generate audio briefing from agenda items
 */
export async function generateAudioBriefing(
  title: string,
  saker: Sak[],
  options: SpeechOptions = {},
  onProgress?: ProgressCallback
): Promise<SkillResult<AudioBriefing>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const bridge = getSkillBridge();

  // Check environment
  const envCheck = bridge.checkEnvironment('speech');
  if (!envCheck.ready) {
    return {
      success: false,
      error: `Missing environment variables: ${envCheck.missing.join(', ')}`,
      logs: ['Environment check failed']
    };
  }

  // Build briefing script
  const script = buildBriefingScript(saker);

  // Check if script needs to be chunked
  if (script.length > 4096) {
    return generateChunkedAudioBriefing(title, saker, opts, onProgress);
  }

  const instructions = `
Voice Affect: Professional and energetic, suitable for radio.
Tone: Friendly, informative, and engaging.
Pacing: Moderate, with natural pauses between items.
Emphasis: Stress key points in each news item.
Pronunciation: Clear enunciation of Norwegian names and terms.
  `.trim();

  const result = await bridge.execute<{ audioPath: string; duration?: number }>(
    'speech',
    {
      action: 'generate',
      input: script,
      model: opts.model,
      voice: opts.voice,
      response_format: opts.responseFormat,
      speed: opts.speed,
      instructions: opts.instructions || instructions
    },
    onProgress
  );

  if (!result.success) {
    return result as SkillResult<AudioBriefing>;
  }

  const briefing: AudioBriefing = {
    id: crypto.randomUUID(),
    title,
    audioPath: result.outputPath || '',
    duration: result.data?.duration,
    createdAt: new Date().toISOString(),
    items: [
      { type: 'intro', content: 'Intro til briefing' },
      ...saker.map((sak) => ({
        type: 'sak' as const,
        content: sak.title,
        sakId: sak.id
      })),
      { type: 'outro', content: 'Outro' }
    ]
  };

  // Save to storage
  saveBriefingToStorage(briefing);

  return {
    ...result,
    data: briefing
  };
}

/**
 * Generate audio for a single agenda item
 */
export async function generateSakAudio(
  sak: Sak,
  options: SpeechOptions = {},
  onProgress?: ProgressCallback
): Promise<SkillResult<{ audioPath: string }>> {
  const text = `${sak.title}. ${sak.description || ''}`;
  
  const instructions = `
Voice Affect: Clear and professional.
Tone: Informative and engaging.
Pacing: Natural, with pauses at punctuation.
  `.trim();

  return textToSpeech(
    text,
    { ...options, instructions: options.instructions || instructions },
    onProgress
  );
}

/**
 * Batch generate audio files
 */
export async function batchGenerateSpeech(
  items: Array<{
    text: string;
    outputName: string;
    voice?: SpeechVoice;
    instructions?: string;
  }>,
  options: SpeechOptions = {},
  onProgress?: ProgressCallback
): Promise<SkillResult<{ generated: number; failed: number; outputs: string[] }>> {
  const bridge = getSkillBridge();
  const outputs: string[] = [];
  let generated = 0;
  let failed = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    
    try {
      const result = await bridge.execute(
        'speech',
        {
          action: 'generate',
          input: item.text,
          model: options.model || DEFAULT_OPTIONS.model,
          voice: item.voice || options.voice || DEFAULT_OPTIONS.voice,
          response_format: options.responseFormat || DEFAULT_OPTIONS.responseFormat,
          instructions: item.instructions || options.instructions
        },
        (progress, message) => {
          if (onProgress) {
            const overallProgress = (i / items.length) * 100 + (progress / items.length);
            onProgress(overallProgress, `Item ${i + 1}/${items.length}: ${message}`);
          }
        }
      );

      if (result.success && result.outputPath) {
        outputs.push(result.outputPath);
        generated++;
      } else {
        failed++;
      }
    } catch {
      failed++;
    }
  }

  return {
    success: failed === 0,
    data: { generated, failed, outputs },
    logs: [`Batch complete: ${generated} generated, ${failed} failed`]
  };
}

/**
 * Get all saved briefings
 */
export function getAllBriefings(): AudioBriefing[] {
  try {
    const stored = localStorage.getItem('mc-audio-briefings');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Delete a briefing
 */
export function deleteBriefing(briefingId: string): boolean {
  try {
    const briefings = getAllBriefings();
    const filtered = briefings.filter((b) => b.id !== briefingId);
    localStorage.setItem('mc-audio-briefings', JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

/**
 * Preview text (returns estimated duration)
 */
export function estimateDuration(text: string, speed: number = 1.0): number {
  // Rough estimate: ~150 words per minute at normal speed
  const wordCount = text.trim().split(/\s+/).length;
  const minutes = wordCount / 150;
  return Math.round(minutes * 60 / speed); // Return seconds
}

/**
 * Get available voices
 */
export function getAvailableVoices(): Array<{ id: SpeechVoice; name: string; description: string }> {
  return [
    { id: 'coral', name: 'Coral', description: 'Warm, natural female voice (recommended)' },
    { id: 'marin', name: 'Marin', description: 'Clear, professional female voice' },
    { id: 'juniper', name: 'Juniper', description: 'Friendly, approachable female voice' },
    { id: 'ember', name: 'Ember', description: 'Confident, energetic male voice' },
    { id: 'alloy', name: 'Alloy', description: 'Neutral, versatile voice' },
    { id: 'echo', name: 'Echo', description: 'Deep, authoritative male voice' },
    { id: 'fable', name: 'Fable', description: 'British accent, storyteller quality' },
    { id: 'onyx', name: 'Onyx', description: 'Deep, cinematic male voice' },
    { id: 'nova', name: 'Nova', description: 'Professional female voice' },
    { id: 'shimmer', name: 'Shimmer', description: 'Bright, optimistic female voice' }
  ];
}

/**
 * Get recommended voice for content type
 */
export function getRecommendedVoice(contentType: 'news' | 'briefing' | 'story' | 'ad'): SpeechVoice {
  switch (contentType) {
    case 'news':
      return 'coral';
    case 'briefing':
      return 'marin';
    case 'story':
      return 'fable';
    case 'ad':
      return 'ember';
    default:
      return 'coral';
  }
}

// Helper functions
function buildBriefingScript(saker: Sak[]): string {
  const intro = 'God morgen! Her er dagens briefing fra Mission Control.';
  
  const items = saker.map((sak, index) => {
    const category = sak.category.replace('_', ' ').toLowerCase();
    return `Sak nummer ${index + 1}: ${sak.title}. Kategori: ${category}.${sak.description ? ` ${sak.description}` : ''}`;
  });
  
  const outro = 'Det var alt for denne gangen. Ha en fin dag!';
  
  return [intro, ...items, outro].join('\n\n');
}

async function generateChunkedAudioBriefing(
  title: string,
  saker: Sak[],
  options: SpeechOptions,
  onProgress?: ProgressCallback
): Promise<SkillResult<AudioBriefing>> {
  // Split into chunks of ~4000 chars each
  const chunks: string[] = [];
  let currentChunk = '';
  
  const intro = 'God morgen! Her er dagens briefing fra Mission Control.\n\n';
  const outro = '\n\nDet var alt for denne gangen. Ha en fin dag!';
  
  for (const sak of saker) {
    const sakText = `${sak.title}. ${sak.description || ''}\n\n`;
    
    if ((currentChunk + sakText).length > 3800) {
      chunks.push(currentChunk);
      currentChunk = sakText;
    } else {
      currentChunk += sakText;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }

  // Generate audio for each chunk
  const bridge = getSkillBridge();
  const audioPaths: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const isFirst = i === 0;
    const isLast = i === chunks.length - 1;
    
    const text = `${isFirst ? intro : ''}${chunks[i]}${isLast ? outro : ''}`;
    
    const result = await bridge.execute(
      'speech',
      {
        action: 'generate',
        input: text,
        model: options.model,
        voice: options.voice,
        response_format: options.responseFormat,
        speed: options.speed
      },
      onProgress
    );

    if (result.outputPath) {
      audioPaths.push(result.outputPath);
    }
  }

  // In a real implementation, we would concatenate the audio files
  // For now, return the first path
  const briefing: AudioBriefing = {
    id: crypto.randomUUID(),
    title: `${title} (chunked)`,
    audioPath: audioPaths[0] || '',
    createdAt: new Date().toISOString(),
    items: saker.map((sak) => ({
      type: 'sak',
      content: sak.title,
      sakId: sak.id
    }))
  };

  saveBriefingToStorage(briefing);

  return {
    success: true,
    data: briefing,
    outputPath: briefing.audioPath,
    logs: [`Generated ${audioPaths.length} audio chunks`]
  };
}

function saveBriefingToStorage(briefing: AudioBriefing): void {
  try {
    const existing = getAllBriefings();
    existing.push(briefing);
    // Keep only last 20 briefings
    const trimmed = existing.slice(-20);
    localStorage.setItem('mc-audio-briefings', JSON.stringify(trimmed));
  } catch (error) {
    console.error('Failed to save briefing:', error);
  }
}

// Export all functions
export default {
  textToSpeech,
  generateAudioBriefing,
  generateSakAudio,
  batchGenerateSpeech,
  getAllBriefings,
  deleteBriefing,
  estimateDuration,
  getAvailableVoices,
  getRecommendedVoice
};
