/* ============================================
   USE VOICE HOOK
   Convenience wrapper around VoiceContext.
   ============================================ */

import { useContext } from 'react';

import { VoiceContext, type VoiceState } from './VoiceContext';

/**
 * Hook that exposes voice chat state and controls.
 *
 * Returns the current voice state from `VoiceContext`.
 * When `isEnabled` is false (default), all actions are no-ops.
 *
 * @example
 * ```tsx
 * const { isEnabled, isListening, startListening, stopListening } = useVoice();
 * if (!isEnabled) return null;
 * ```
 */
export function useVoice(): VoiceState {
  return useContext(VoiceContext);
}

export default useVoice;
