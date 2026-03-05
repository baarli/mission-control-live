/* ============================================
   VOICE CONTEXT
   Feature-flagged voice chat plumbing.
   Enable with VITE_VOICE_ENABLED=true.
   ============================================ */

import { createContext } from 'react';

export interface VoiceState {
  /** Whether the voice feature is enabled via VITE_VOICE_ENABLED */
  isEnabled: boolean;
  /** Whether the user is currently listening (microphone active) */
  isListening: boolean;
  /** Whether audio is currently being played back */
  isSpeaking: boolean;
  /** Start listening for voice input */
  startListening: () => void;
  /** Stop listening for voice input */
  stopListening: () => void;
}

export const voiceDefaultState: VoiceState = {
  isEnabled: false,
  isListening: false,
  isSpeaking: false,
  startListening: () => {},
  stopListening: () => {},
};

export const VoiceContext = createContext<VoiceState>(voiceDefaultState);
