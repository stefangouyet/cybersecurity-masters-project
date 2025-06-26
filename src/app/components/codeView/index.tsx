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
      <textarea
        placeholder="Paste rules here (e.g., match /members/{memberId} {...})"
        value={pastedRules}
        onChange={(e) => setPastedRules(e.target.value)}
        className={styles.textarea}
      />
      <button onClick={handlePasteRules} className={styles.button}>Set Rules</button>
      {error && <p className={styles.error}>{error}</p>}
      <pre className={styles.pre}>{rulesCode}</pre>
      <button onClick={() => navigator.clipboard.writeText(rulesCode)} className={styles.button}>Copy</button>
    </div>
  );
}