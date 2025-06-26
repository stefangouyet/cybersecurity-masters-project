'use client';

import styles from './explanation.module.css';

interface ExplanationProps {
  explanation: string;
}

export default function Explanation({ explanation }: ExplanationProps) {
  return explanation ? (
    <p className={styles.explanation}>{explanation}</p>
  ) : null;
}