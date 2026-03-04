/* ============================================
   PROMPTS
   AI prompts and templates for Mission Control
   ============================================ */

import type { Category } from '../types';

/**
 * Search prompt templates
 */
export const SEARCH_PROMPTS = {
  /**
   * Default search prompt for Brave Search API
   */
  DEFAULT: `Søk etter relevante nyheter om NRJ, radio, musikk, kjendiser og underholdning.
Fokuser på norske kilder og aktuelle saker.
Prioriter artikler fra de siste 7 dagene.`,

  /**
   * Prompt for celebrity news
   */
  CELEBRITY: `Søk etter nyheter om norske og internasjonale kjendiser.
Inkluder: reality-deltakere, artister, skuespillere, influencere.
Fokuser på drama, forhold, og aktuelle hendelser.`,

  /**
   * Prompt for music news
   */
  MUSIC: `Søk etter nyheter om musikk, artister, album og singler.
Inkluder: norske artister, internasjonale hits, konsertomtaler, musikkpriser.
Fokuser på pop, hip-hop og aktuelle trender.`,

  /**
   * Prompt for TV and film
   */
  TV_FILM: `Søk etter nyheter om TV-serier, filmer og streaming.
Inkluder: Netflix, HBO, Disney+, Viaplay, NRK, TV2.
Fokuser på premieredatoer, anmeldelser og trailere.`,

  /**
   * Prompt for reality TV
   */
  REALITY: `Søk etter nyheter om reality-TV og dokusåper.
Inkluder: Love Island, Paradise Hotel, Ex on the Beach, 71 grader nord.
Fokuser på deltakere, drama og elimineringer.`,

  /**
   * Prompt for international news
   */
  INTERNATIONAL: `Søk etter internasjonale nyheter med underholdningsvinkel.
Inkluder: Hollywood, britiske kjendiser, europeisk popkultur.
Fokuser på skandaler, premierer og trender.`
};

/**
 * Get search prompt by category
 */
export function getSearchPrompt(category: Category | 'default'): string {
  switch (category) {
    case 'KJENDIS_DRAMA':
      return SEARCH_PROMPTS.CELEBRITY;
    case 'MUSIKK':
      return SEARCH_PROMPTS.MUSIC;
    case 'FILM_TV':
      return SEARCH_PROMPTS.TV_FILM;
    case 'REALITY_TV':
      return SEARCH_PROMPTS.REALITY;
    case 'INTERNASJONALT':
      return SEARCH_PROMPTS.INTERNATIONAL;
    default:
      return SEARCH_PROMPTS.DEFAULT;
  }
}

/**
 * AI assistant prompts
 */
export const AI_PROMPTS = {
  /**
   * System prompt for content generation
   */
  SYSTEM: `Du er en hjelpsom assistent for NRJ Morgen radioshow.
Du hjelper med å finne relevante nyheter, skrive sakstekster og forberede innhold til sending.
Vær kortfattet, engasjerende og profesjonell.
Bruk et uformelt men profesjonelt språk passende for radio.`,

  /**
   * Prompt for summarizing articles
   */
  SUMMARIZE: `Oppsummer følgende artikkel i 2-3 setninger passende for radiovisning.
Fokuser på det mest interessante for lytterne.
Bruk et enkelt og engasjerende språk:`,

  /**
   * Prompt for generating sak description
   */
  GENERATE_DESCRIPTION: `Skriv en kort beskrivelse (maks 150 tegn) av denne saken for bruk i en radiovisning.
Bør være engasjerende og gi lytterne lyst til å høre mer:`,

  /**
   * Prompt for finding angles
   */
  FIND_ANGLES: `Foreslå 3 interessante vinkler eller diskusjonspunkter basert på denne saken.
Vinklene bør være egnet for radiovisning og engasjere lytterne:`,

  /**
   * Prompt for keyword extraction
   */
  EXTRACT_KEYWORDS: `Trekk ut 5-10 relevante nøkkelord fra denne teksten.
Nøkkelordene vil brukes for å søke etter relaterte artikler:`,

  /**
   * Prompt for content analysis
   */
  ANALYZE_CONTENT: `Analyser følgende innhold og vurder:
1. Er det relevant for et ungt publikum (16-34 år)?
2. Er det nyhetsverdig nok for radio?
3. Passer det for morgensending?
4. Gi en vurdering fra 1-10 og begrunnelse:`
};

/**
 * Content generation templates
 */
export const CONTENT_TEMPLATES = {
  /**
   * Template for intro text
   */
  INTRO: (showName: string, date: string) => 
    `Velkommen til ${showName} - ${date}!`,

  /**
   * Template for sak presentation
   */
  SAK_PRESENTATION: (title: string, category: string) =>
    `Neste sak: ${title} [${category}]`,

  /**
   * Template for breaking news
   */
  BREAKING_NEWS: (headline: string) =>
    `⚡ BREAKING: ${headline}`,

  /**
   * Template for weather mention
   */
  WEATHER: (forecast: string) =>
    `Og for de som lurer på været i dag: ${forecast}`,

  /**
   * Template for outro
   */
  OUTRO: (showName: string, nextShow?: string) =>
    nextShow 
      ? `Takk for at du lyttet til ${showName}! Husk å stille klokka for ${nextShow}.`
      : `Takk for at du lyttet til ${showName}! Ha en strålende dag!`
};

/**
 * Error message templates
 */
export const ERROR_MESSAGES = {
  SEARCH_FAILED: 'Søket feilet. Prøv igjen senere.',
  FETCH_FAILED: 'Kunne ikke hente data. Sjekk internettforbindelsen.',
  SAVE_FAILED: 'Kunne ikke lagre endringene.',
  DELETE_FAILED: 'Kunne ikke slette.',
  AUTH_FAILED: 'Innlogging feilet. Sjekk passordet.',
  NETWORK_ERROR: 'Nettverksfeil. Prøv igjen.',
  UNKNOWN_ERROR: 'En ukjent feil oppstod.'
};

/**
 * Success message templates
 */
export const SUCCESS_MESSAGES = {
  SAVED: 'Lagret!',
  DELETED: 'Slettet!',
  UPDATED: 'Oppdatert!',
  EXPORTED: 'Eksportert!',
  COPIED: 'Kopiert til utklippstavlen!',
  SYNCED: 'Synkronisert!'
};

/**
 * Confirmation message templates
 */
export const CONFIRM_MESSAGES = {
  DELETE_SAK: 'Er du sikker på at du vil slette denne saken?',
  DELETE_ALL: 'Er du sikker på at du vil slette alle elementer?',
  LOGOUT: 'Er du sikker på at du vil logge ut?',
  UNSAVED_CHANGES: 'Du har ulagrede endringer. Vil du fortsette?'
};

/**
 * Placeholder texts
 */
export const PLACEHOLDERS = {
  SEARCH: 'Søk etter nyheter...',
  SAK_TITLE: 'Skriv inn sakstittel...',
  SAK_DESCRIPTION: 'Beskrivelse av saken...',
  URL: 'https://...',
  NOTES: 'Notater...'
};

/**
 * Label texts
 */
export const LABELS = {
  CATEGORY: 'Kategori',
  DATE: 'Dato',
  SOURCE: 'Kilde',
  LINK: 'Lenke',
  NOTES: 'Notater',
  SEARCH: 'Søk',
  FILTER: 'Filter',
  SORT: 'Sortering',
  EXPORT: 'Eksporter',
  IMPORT: 'Importer'
};

export default {
  SEARCH_PROMPTS,
  AI_PROMPTS,
  CONTENT_TEMPLATES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  CONFIRM_MESSAGES,
  PLACEHOLDERS,
  LABELS,
  getSearchPrompt
};
