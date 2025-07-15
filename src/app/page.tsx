'use client';

import { setRules } from '@/store/slice';
import InfoIcon from '@mui/icons-material/Info';
import { Checkbox, FormControlLabel, Tooltip } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import styles from './page.module.css';

export default function Home() {
  const dispatch = useDispatch();
  const router = useRouter();
  const [mode, setMode] = useState<'code' | 'rules' | 'text'>('code');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [granular, setGranular] = useState(false); // ✅ new state

  console.log('granular', granular)

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      let endpoint = '/api/generate-rules';
      let body: any = { firestoreCode: input, granularOperations: granular };
      if (mode === 'rules') endpoint = '/api/generate-from-rules';
      if (mode === 'text') {
        endpoint = '/api/generate-rules-from-text';
        body = { description: input };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      //  const res = await fetch('/api/generate-rules', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ firestoreCode }),
      // });

      // const { rules, explanation } = await res.json();

      const { rules, explanation } = await response.json();
      dispatch(setRules({ generatedRules: rules, rulesExplanation: explanation || '' }));
      router.push('/rules');
    } catch (error) {
      console.error('Failed to generate rules:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.wrapper}>
      <h1 className={styles.title}>Firestore Rules Assistant</h1>
      <p className={styles.subtitle}>
        Choose an input method and generate Firestore rules with AI.
      </p>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${mode === 'code' ? styles.activeTab : ''}`}
          onClick={() => setMode('code')}
        >
          Paste Firestore Code
        </button>
        <button
          className={`${styles.tabButton} ${mode === 'rules' ? styles.activeTab : ''}`}
          onClick={() => setMode('rules')}
        >
          Paste Existing Rules
        </button>
        <button
          className={`${styles.tabButton} ${mode === 'text' ? styles.activeTab : ''}`}
          onClick={() => setMode('text')}
        >
          Describe Your Schema
        </button>
      </div>

      <textarea
        className={styles.inputArea}
        placeholder={
          mode === 'code'
            ? 'Paste your Firestore setDoc/getDoc code here...'
            : mode === 'rules'
              ? 'Paste your Firebase security rules here...'
              : 'Describe your app or schema in plain English...'
        }
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <div className={styles.checkboxContainer} style={{ display: 'flex', alignItems: 'center', marginTop: '1rem' }}>
        <FormControlLabel
          control={<Checkbox checked={granular} onChange={(e) => setGranular(e.target.checked)} />}
          label="Use Granular Operations"
        />
        <Tooltip
          title={
            <span>
              Granular operations let you specify rules for create, update, delete, get, and list separately,
              instead of using general read/write.{' '}
              <a
                href="https://firebase.google.com/docs/firestore/security/rules-structure#granular_operations"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'lightblue', textDecoration: 'underline' }}
              >
                Learn more
              </a>
            </span>
          }
        >
          <InfoIcon style={{ cursor: 'pointer' }} />
        </Tooltip>
      </div>

      <button
        className={styles.generateBtn}
        onClick={handleSubmit}
        disabled={loading || !input.trim()}
      >
        {loading ? 'Generating...' : 'Generate Rules'}
      </button>
    </main>
  );
}
