'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from './page.module.css';

export default function HomePage() {
  const [firestoreCode, setFirestoreCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!firestoreCode.trim()) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/generate-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firestoreCode }),
      });

      const { rules, explanation } = await res.json();

      if (!res.ok || !rules) {
        console.error('[API ERROR]', { rules, explanation });
        alert('Failed to generate rules');
        return;
      }

      localStorage.setItem('generatedRules', rules);
      localStorage.setItem('rulesExplanation', explanation);
      router.push('/rules');
    } catch (err) {
      console.error('API call failed:', err);
      alert('Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Step 1: Paste Firestore Code</h1>
      <textarea
        className={styles.textarea}
        value={firestoreCode}
        onChange={(e) => setFirestoreCode(e.target.value)}
        placeholder={`Example:\nawait setDoc(doc(db, "users", user.uid), { name: "Alice" });`}
      />
      <button className={styles.buttonPrimary} onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Generating…' : 'Next'}
      </button>
    </main>
  );
}
