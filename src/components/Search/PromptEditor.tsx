/* ============================================
   PROMPT EDITOR COMPONENT
   ============================================ */

import React, { useState, useCallback } from 'react';
import { Button } from '../UI';
import styles from './PromptEditor.module.css';

interface PromptEditorProps {
  value: string;
  onChange: (value: string) => void;
  defaultPrompt?: string;
  label?: string;
}

const DEFAULT_PROMPT = `Vurder underholdningsverdien for NRJ Morgen (morgenradio, 18-35 år).

SCORING (0-100):
- 80-100: Høy underholdning (brudd, drama, avsløring, skandale)
- 60-79: God underholdning (kjendisnytt, reality, viral)
- 40-59: Middels (film/musikk, lett underholdning)
- 0-39: Lav (sport, politikk, harde nyheter)

POSITIVE FAKTORER (+10 hver):
- brudd, krangel, drama, skandale, avsløring
- hemmelig, kontrovers, konflikt, exit, overraskelse
- pinlig, sterkt sitat, tårer, raser, sjokk, kaos

NEGATIVE FAKTORER (-20 hver):
- sport, politikk, økonomi, skatt, lovforslag
- krig, konflikt, død, ulykke, tragedie

Returner KUN et tall (0-100).`;

const PromptEditor: React.FC<PromptEditorProps> = ({
  value,
  onChange,
  defaultPrompt = DEFAULT_PROMPT,
  label = '🎭 Prompt for underholdningsscore',
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleReset = useCallback(() => {
    if (window.confirm('Tilbakestill til standard prompt?')) {
      onChange(defaultPrompt);
    }
  }, [defaultPrompt, onChange]);

  const lineCount = value.split('\n').length;

  return (
    <div className={styles.container}>
      {/* Label */}
      <div className={styles.header}>
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={styles.toggle}
          aria-expanded={isExpanded}
        >
          <span className={[styles.chevron, isExpanded && styles.expanded].filter(Boolean).join(' ')}>
            ▼
          </span>
          <span>{label}</span>
        </button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className={styles.resetButton}
        >
          Tilbakestill
        </Button>
      </div>

      {/* Editor */}
      {isExpanded && (
        <div className={styles.editorWrapper}>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={styles.editor}
            rows={Math.min(Math.max(lineCount + 1, 8), 20)}
            spellCheck={false}
            aria-label="Prompt editor"
          />
          <div className={styles.footer}>
            <span className={styles.charCount}>
              {value.length} tegn
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptEditor;
