'use client';

import styles from './codeView.module.css';

interface CodeViewProps {
  rulesCode: string;
  error: string;
  pastedRules: string;
  setPastedRules: (rules: string) => void;
  handlePasteRules: () => void;
}

export default function CodeView({
  rulesCode,
  error,
  pastedRules,
  setPastedRules,
  handlePasteRules,
}: CodeViewProps) {
  return (
    <div className={styles.codeBlock}>
      {error && <p className={styles.error}>{error}</p>}
      <pre className={styles.pre}>{rulesCode}</pre>
      <button onClick={() => navigator.clipboard.writeText(rulesCode)} className={styles.button}>Copy</button>
    </div>
  );
}