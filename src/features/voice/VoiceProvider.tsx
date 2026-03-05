/* ============================================
   VOICE PROVIDER
   Wraps the application with voice chat state.
   ============================================ */

import { useMemo, type ReactNode } from 'react';

import { VoiceContext, type VoiceState } from './VoiceContext';

export interface VoiceProviderProps {
  children: ReactNode;
}

/**
 * VoiceProvider wraps the application to provide voice chat state.
 * When VITE_VOICE_ENABLED is not "true", all methods are no-ops and
 * the feature is completely inactive with no runtime side-effects.
 */
export function VoiceProvider({ children }: VoiceProviderProps) {
  const isEnabled = import.meta.env.VITE_VOICE_ENABLED === 'true';

  const value = useMemo<VoiceState>(
    () => ({
      isEnabled,
      isListening: false,
      isSpeaking: false,
      startListening: isEnabled
        ? () => {
            // TODO: implement voice recognition when VITE_VOICE_ENABLED=true
            console.warn('[VoiceProvider] startListening not yet implemented');
          }
        : () => {},
      stopListening: isEnabled
        ? () => {
            // TODO: implement voice recognition when VITE_VOICE_ENABLED=true
            console.warn('[VoiceProvider] stopListening not yet implemented');
          }
        : () => {},
    }),
    [isEnabled]
  );

  return <VoiceContext.Provider value={value}>{children}</VoiceContext.Provider>;
}
