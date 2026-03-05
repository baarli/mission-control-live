/* ============================================
   IMAGEGEN SKILL INTEGRATION
   AI image generation for podcast and social media
   ============================================ */

import { getSkillBridge, type SkillResult, type ProgressCallback } from './bridge';

export type ImageGenerationType =
  | 'podcast-thumbnail'
  | 'social-media'
  | 'hero-image'
  | 'episode-art';

export type ImageSize = '1024x1024' | '1536x1024' | '1024x1536' | 'auto';

export type ImageQuality = 'low' | 'medium' | 'high' | 'auto';

export interface ImageGenerationOptions {
  type?: ImageGenerationType;
  size?: ImageSize;
  quality?: ImageQuality;
  background?: 'transparent' | 'opaque' | 'auto';
  outputFormat?: 'png' | 'jpeg' | 'webp';
  outputDir?: string;
}

export interface GeneratedImage {
  url: string;
  path: string;
  prompt: string;
  revisedPrompt?: string;
  size: string;
  createdAt: string;
}

export interface PodcastThumbnailData {
  episodeNumber?: number;
  episodeTitle: string;
  showName: string;
  guestName?: string;
  theme?: 'dark' | 'light' | 'colorful';
  style?: 'modern' | 'retro' | 'minimal' | 'bold';
}

export interface SocialMediaGraphicData {
  platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin';
  message: string;
  includeImage?: boolean;
  callToAction?: string;
  brandColors?: string[];
}

const DEFAULT_OPTIONS: ImageGenerationOptions = {
  type: 'podcast-thumbnail',
  size: '1024x1024',
  quality: 'auto',
  background: 'auto',
  outputFormat: 'png',
};

/**
 * Generate thumbnail image for podcast
 */
export async function generatePodcastThumbnail(
  data: PodcastThumbnailData,
  options: ImageGenerationOptions = {},
  onProgress?: ProgressCallback
): Promise<SkillResult<GeneratedImage>> {
  const opts = { ...DEFAULT_OPTIONS, ...options, type: 'podcast-thumbnail' as const };
  const bridge = getSkillBridge();

  // Check environment
  const envCheck = bridge.checkEnvironment('imagegen');
  if (!envCheck.ready) {
    return {
      success: false,
      error: `Missing environment variables: ${envCheck.missing.join(', ')}`,
      logs: ['Environment check failed'],
    };
  }

  const prompt = buildPodcastThumbnailPrompt(data);

  return bridge.execute(
    'imagegen',
    {
      action: 'generate',
      prompt,
      model: 'gpt-image-1.5',
      size: opts.size,
      quality: opts.quality,
      background: opts.background,
      outputFormat: opts.outputFormat,
      outputName: `podcast-thumb-${data.episodeNumber || Date.now()}`,
    },
    onProgress
  );
}

/**
 * Generate social media graphics
 */
export async function generateSocialMediaGraphic(
  data: SocialMediaGraphicData,
  options: ImageGenerationOptions = {},
  onProgress?: ProgressCallback
): Promise<SkillResult<GeneratedImage>> {
  const opts = { ...DEFAULT_OPTIONS, ...options, type: 'social-media' as const };
  const bridge = getSkillBridge();

  // Check environment
  const envCheck = bridge.checkEnvironment('imagegen');
  if (!envCheck.ready) {
    return {
      success: false,
      error: `Missing environment variables: ${envCheck.missing.join(', ')}`,
      logs: ['Environment check failed'],
    };
  }

  const prompt = buildSocialMediaPrompt(data);
  const size = getSocialMediaSize(data.platform);

  return bridge.execute(
    'imagegen',
    {
      action: 'generate',
      prompt,
      model: 'gpt-image-1.5',
      size,
      quality: opts.quality,
      outputFormat: opts.outputFormat,
      outputName: `social-${data.platform}-${Date.now()}`,
    },
    onProgress
  );
}

/**
 * Generate hero image for landing page
 */
export async function generateHeroImage(
  title: string,
  subtitle?: string,
  _options: ImageGenerationOptions = {},
  onProgress?: ProgressCallback
): Promise<SkillResult<GeneratedImage>> {
  const bridge = getSkillBridge();

  const envCheck = bridge.checkEnvironment('imagegen');
  if (!envCheck.ready) {
    return {
      success: false,
      error: `Missing environment variables: ${envCheck.missing.join(', ')}`,
      logs: ['Environment check failed'],
    };
  }

  const prompt = buildHeroImagePrompt(title, subtitle);

  return bridge.execute(
    'imagegen',
    {
      action: 'generate',
      prompt,
      model: 'gpt-image-1.5',
      size: '1536x1024',
      quality: 'high',
      outputFormat: 'png',
      outputName: `hero-${Date.now()}`,
    },
    onProgress
  );
}

/**
 * Generate episode artwork
 */
export async function generateEpisodeArt(
  episodeTitle: string,
  showName: string,
  episodeNumber: number,
  options: ImageGenerationOptions = {},
  onProgress?: ProgressCallback
): Promise<SkillResult<GeneratedImage>> {
  return generatePodcastThumbnail(
    {
      episodeTitle,
      showName,
      episodeNumber,
      style: 'modern',
    },
    { ...options, size: '1024x1024', quality: 'high' },
    onProgress
  );
}

/**
 * Edit an existing image
 */
export async function editImage(
  imagePath: string,
  prompt: string,
  maskPath?: string,
  options: ImageGenerationOptions = {},
  onProgress?: ProgressCallback
): Promise<SkillResult<GeneratedImage>> {
  const bridge = getSkillBridge();

  const envCheck = bridge.checkEnvironment('imagegen');
  if (!envCheck.ready) {
    return {
      success: false,
      error: `Missing environment variables: ${envCheck.missing.join(', ')}`,
      logs: ['Environment check failed'],
    };
  }

  return bridge.execute(
    'imagegen',
    {
      action: 'edit',
      imagePath,
      prompt,
      maskPath,
      model: 'gpt-image-1.5',
      size: options.size,
      outputFormat: options.outputFormat,
    },
    onProgress
  );
}

/**
 * Create transparent background version
 */
export async function createTransparentBackground(
  imagePath: string,
  onProgress?: ProgressCallback
): Promise<SkillResult<GeneratedImage>> {
  const bridge = getSkillBridge();

  return bridge.execute(
    'imagegen',
    {
      action: 'edit',
      imagePath,
      prompt: 'Remove background, make transparent',
      background: 'transparent',
    },
    onProgress
  );
}

// Prompt builders
function buildPodcastThumbnailPrompt(data: PodcastThumbnailData): string {
  const parts = [
    `Use case: podcast-thumbnail`,
    `Asset type: podcast cover art`,
    `Primary request: Professional podcast thumbnail for "${data.showName}"`,
    `Subject: ${data.episodeTitle}`,
    data.guestName ? `Guest: ${data.guestName}` : '',
    `Style/medium: ${data.style || 'modern'} podcast artwork`,
    `Theme: ${data.theme || 'colorful'}`,
    `Composition/framing: Centered, eye-catching design suitable for podcast platforms`,
    `Text: "${data.showName}"${data.episodeNumber ? ` - Episode ${data.episodeNumber}` : ''}`,
    `Constraints: Must be readable at small sizes, bold typography, high contrast`,
    `Avoid: Cluttered design, small text, busy backgrounds`,
  ];

  return parts.filter(Boolean).join('\n');
}

function buildSocialMediaPrompt(data: SocialMediaGraphicData): string {
  const size = getSocialMediaSize(data.platform);

  const parts = [
    `Use case: social-media`,
    `Asset type: ${data.platform} post`,
    `Primary request: Engaging social media graphic`,
    `Message: "${data.message}"`,
    data.callToAction ? `Call to action: ${data.callToAction}` : '',
    `Platform: ${data.platform}`,
    `Size: ${size}`,
    `Style/medium: Clean, professional social media design`,
    `Constraints: On-brand colors${data.brandColors ? ` (${data.brandColors.join(', ')})` : ''}`,
    `Avoid: Generic stock imagery, text too small for mobile`,
  ];

  return parts.filter(Boolean).join('\n');
}

function buildHeroImagePrompt(title: string, subtitle?: string): string {
  const parts = [
    `Use case: hero-image`,
    `Asset type: landing page hero`,
    `Primary request: Bold hero image for "${title}"`,
    subtitle ? `Subtitle context: ${subtitle}` : '',
    `Style/medium: Modern, dynamic photography or illustration`,
    `Composition/framing: Wide format, generous negative space for text overlay`,
    `Lighting/mood: Professional, engaging`,
    `Constraints: Suitable for web hero section, high resolution`,
    `Avoid: Text in image (will be added via HTML), busy patterns that conflict with text`,
  ];

  return parts.filter(Boolean).join('\n');
}

function getSocialMediaSize(platform: string): ImageSize {
  switch (platform) {
    case 'instagram':
      return '1024x1024';
    case 'facebook':
      return '1200x630' as ImageSize; // Use closest standard size
    case 'twitter':
      return '1200x675' as ImageSize;
    case 'linkedin':
      return '1200x627' as ImageSize;
    default:
      return '1024x1024';
  }
}

/**
 * Get image generation cost estimate
 */
export function estimateCost(
  count: number,
  quality: ImageQuality = 'auto'
): { tokens: number; approximateCost: string } {
  // Rough estimates based on OpenAI pricing
  const baseTokens = quality === 'high' ? 4000 : quality === 'medium' ? 2000 : 1000;
  const totalTokens = baseTokens * count;

  // Approximate cost in USD (varies by model)
  const costPer1K = 0.04; // Approximate
  const cost = (totalTokens / 1000) * costPer1K;

  return {
    tokens: totalTokens,
    approximateCost: `$${cost.toFixed(2)} USD`,
  };
}

/**
 * Validate image prompt
 */
export function validatePrompt(prompt: string): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!prompt || prompt.trim().length < 10) {
    issues.push('Prompt too short (minimum 10 characters)');
  }

  if (prompt.length > 4000) {
    issues.push('Prompt too long (maximum 4000 characters)');
  }

  // Check for potentially problematic content
  const problematicTerms = ['hate', 'violence', 'explicit', 'nsfw'];
  const lowerPrompt = prompt.toLowerCase();
  for (const term of problematicTerms) {
    if (lowerPrompt.includes(term)) {
      issues.push(`Prompt contains potentially problematic term: "${term}"`);
    }
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}

// Export all functions
export default {
  generatePodcastThumbnail,
  generateSocialMediaGraphic,
  generateHeroImage,
  generateEpisodeArt,
  editImage,
  createTransparentBackground,
  estimateCost,
  validatePrompt,
};
