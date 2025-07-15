'use client';

import styles from './codeView.module.css';

interface CodeViewProps {
  rulesCode: string;
  error: string;
  pastedRules: string;
  selectedPath: string;
  setPastedRules: (rules: string) => void;
  handlePasteRules: () => void;
}

export default function CodeView({
  rulesCode,
  error,
  selectedPath,
  pastedRules,
  setPastedRules,
  handlePasteRules,
}: CodeViewProps) {
  return (
    <div className={styles.codeBlock}>
      {error && <p className={styles.error}>{error}</p>}
      <pre className={styles.pre}>
        {(() => {
          if (!selectedPath) return rulesCode.split('\n').map((line, i) => <div key={i}>{line}</div>);
          // Find the block for the selectedPath robustly
          const lines = rulesCode.split('\n');
          let highlightStart = -1;
          let highlightEnd = -1;
          let depth = 0;
          const matchRegex = new RegExp(`^\\s*match\\s+${selectedPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*\\{`);
          for (let i = 0; i < lines.length; i++) {
            if (highlightStart === -1 && matchRegex.test(lines[i])) {
              highlightStart = i;
              depth = 0;
            }
            if (highlightStart !== -1) {
              if (lines[i].includes('{')) depth++;
              if (lines[i].includes('}')) depth--;
              if (depth === 0) {
                highlightEnd = i;
                break;
              }
            }
          }
          return lines.map((line, i) => {
            const highlighted = highlightStart !== -1 && highlightEnd !== -1 && i >= highlightStart && i <= highlightEnd ? styles.highlight : '';
            return <div key={i} className={highlighted}>{line}</div>;
          });
        })()}
      </pre>
    </div>
  );
}