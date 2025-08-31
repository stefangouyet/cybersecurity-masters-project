'use client';
import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import styles from './explanation.module.css';

interface ExplanationProps {
  explanation: string;
}

export default function Explanation({ explanation }: ExplanationProps) {
  const [open, setOpen] = useState(false);
  if (!explanation) return null;

  const enhanceExplanation = (text: string) => {
    let enhanced = text.replace('Explanation:', '').trim();
    return enhanced;
  };

  return (
    <div className={styles.wrapper}>
      <button className={styles.toggle} onClick={() => setOpen(!open)}>
        <span>Explanation</span>
        {open ? <FiChevronUp /> : <FiChevronDown />}
      </button>
      {open && <div className={styles.body}>
        {enhanceExplanation(explanation)}
      </div>}
    </div>
  );
}