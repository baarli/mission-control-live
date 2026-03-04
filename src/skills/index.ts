/* ============================================
   SKILLS - Barrel Export
   ============================================ */

// Bridge
export { 
  getSkillBridge, 
  resetSkillBridge,
  SkillBridge,
  type SkillResult,
  type ProgressCallback,
  type SkillType
} from './bridge';

// Doc integration
export {
  exportSakslisteToDocx,
  generateDailyBriefing,
  generateMeetingAgenda,
  generateFromTemplate,
  getAvailableTemplates,
  previewDocument,
  type DocGenerationOptions,
  type DailyBriefingData,
  type MeetingAgendaData
} from './doc-integration';

// PDF integration
export {
  exportStatsToPdf,
  generateWeeklySummary,
  generatePrintableSaksliste,
  generateChartPdf,
  previewPdf,
  getPdfStatus,
  type PdfGenerationOptions,
  type WeeklySummaryData
} from './pdf-integration';

// Transcribe integration
export {
  transcribeAudio,
  transcribeWithDiarization,
  linkTranscriptionToSak,
  getTranscriptionsForSak,
  getAllTranscriptions,
  deleteTranscription,
  extractQuotes,
  searchTranscription,
  getSupportedAudioFormats,
  validateAudioFile,
  type TranscriptionOptions,
  type TranscriptionResult,
  type LinkedTranscription
} from './transcribe-integration';

// ImageGen integration
export {
  generatePodcastThumbnail,
  generateSocialMediaGraphic,
  generateHeroImage,
  generateEpisodeArt,
  editImage,
  createTransparentBackground,
  estimateCost as estimateImageCost,
  validatePrompt as validateImagePrompt,
  type ImageGenerationType,
  type ImageSize,
  type ImageQuality,
  type ImageGenerationOptions,
  type GeneratedImage,
  type PodcastThumbnailData,
  type SocialMediaGraphicData
} from './imagegen-integration';

// Speech integration
export {
  textToSpeech,
  generateAudioBriefing,
  generateSakAudio,
  batchGenerateSpeech,
  getAllBriefings as getAllAudioBriefings,
  deleteBriefing as deleteAudioBriefing,
  estimateDuration as estimateSpeechDuration,
  getAvailableVoices,
  getRecommendedVoice,
  type SpeechVoice,
  type SpeechModel,
  type SpeechFormat,
  type SpeechOptions,
  type AudioBriefing,
  type BatchSpeechJob
} from './speech-integration';
