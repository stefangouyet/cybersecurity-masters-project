'use client';

import { useAppSelector } from '@/store/hooks';
import { setRules, setUseCustomFunctions } from '@/store/slice';
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
  const [granular, setGranular] = useState(false);
  const { useCustomFunctions } = useAppSelector(state => state.reducer.settings);

  const handleSubmit = async () => {
    if (!input.trim()) return;
    setLoading(true);

    try {
      const endpoint = '/api/generate-firestore-rules';
      const body = {
        inputPrompt: input,
        mode,
        granularOperations: granular,
        useCustomFunctions
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

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
      <h1 className={styles.title}>Firestore Security Rules Toolkit</h1>
      <p className={styles.subtitle}>
        Choose an input method and generate Firestore rules with our tool.
      </p>

      <div className={styles.tabs}>
        <button
          className={`${styles.tabButton} ${mode === 'code' ? styles.activeTab : ''}`}
          onClick={() => setMode('code')}
        >
          Analyze Firestore Code
        </button>
        <button
          className={`${styles.tabButton} ${mode === 'rules' ? styles.activeTab : ''}`}
          onClick={() => setMode('rules')}
        >
          Analyze Existing Rules
        </button>
        <button
          className={`${styles.tabButton} ${mode === 'text' ? styles.activeTab : ''}`}
          onClick={() => setMode('text')}
        >
          Describe Your App/Database
        </button>
      </div>

      <textarea
        className={styles.inputArea}
        placeholder={
          mode === 'code'
            ? 'Paste your Firestore read/write code (setDoc/getDoc, get/set, etc) here...'
            : mode === 'rules'
              ? 'Paste your existing Firestore security rules here (add any additional information about your database after the rules)...'
              : 'Describe your app or database here...'
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
          componentsProps={{
            tooltip: {
              sx: {
                fontSize: 13,
                maxWidth: 300,
                whiteSpace: 'normal',
                padding: '10px 12px',
                lineHeight: 1.4,
              },
            },
          }}
        >
          <InfoIcon style={{ cursor: 'pointer' }} />
        </Tooltip>
      </div>
      <div className={styles.checkboxContainer} style={{ display: 'flex', alignItems: 'center', marginTop: '1rem', marginBottom: '1rem' }}>
        <FormControlLabel
          control={<Checkbox checked={useCustomFunctions} onChange={(e) => dispatch(setUseCustomFunctions(e.target.checked))} />}
          label="Use Custom Functions whenever possible"
        />
        <Tooltip
          title={
            <span>
              Custom functions improve readability by abstracting logic like authentication checks. <br />
              If unchecked, all conditions will be written inline instead of using <code>isAuthenticated()</code> or <code>isDocOwner(userId)</code>.
            </span>
          }
          componentsProps={{
            tooltip: {
              sx: {
                fontSize: 13,
                maxWidth: 300,
                whiteSpace: 'normal',
                padding: '10px 12px',
                lineHeight: 1.4,
              },
            },
          }}
        >
          <InfoIcon style={{ cursor: 'pointer', marginLeft: 4 }} />
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
