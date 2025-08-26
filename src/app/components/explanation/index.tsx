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
    const paths = text.split('\n').filter(line => line.trim().startsWith('match'));
    let enhanced = text.replace('Here are the Firestore security rules that implement these protections:', '').trim();
    if (paths.length > 0) {
      enhanced += '\n\nDetailed Breakdown:\n';
      paths.forEach(path => {
        const pathName = path.replace(/^\s*match\s+\/([^\/]+).*$/, '$1');
        enhanced += `- For the **${pathName}** collection:\n`;
        enhanced += `  - This section defines access controls for the ${pathName} collection. `;
        if (path.includes('{')) {
          enhanced += `It includes a wildcard (e.g., {docId}) to manage individual documents within ${pathName}, ensuring granular security rules apply to each document.\n`;
        } else {
          enhanced += `Access is applied uniformly across all documents in the ${pathName} collection.\n`;
        }
        enhanced += `  - Specific conditions (e.g., authentication or ownership) are enforced to protect data integrity and restrict unauthorized access.\n`;
      });
    }
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