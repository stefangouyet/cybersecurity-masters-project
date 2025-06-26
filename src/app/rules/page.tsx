'use client';

import { useEffect, useState } from 'react';
import styles from './rules.module.css';
import GuiView from '../components/guiView';
import CodeView from '../components/codeView';
import Explanation from '../components/explanation';

const functions = [
  { name: 'isAuthor', description: 'Checks if the user ID matches the document owner ID.' },
  { name: 'isAdmin', description: 'Checks if the user has an admin claim.' },
  { name: 'isOwner', description: 'Checks if the user owns the parent document.' },
  { name: 'isAuthenticated', description: 'Checks if the user is authenticated.' },
  { name: 'isModerator', description: 'Checks if the user has a moderator role.' },
];

const types = ['string', 'number', 'boolean', 'timestamp', 'array', 'map'];

export default function RulesGUI() {
  const [view, setView] = useState<'gui' | 'code'>('gui'); // Default to GUI view for side-by-side
  const [mode, setMode] = useState<'auth' | 'types'>('auth');
  const [rulesCode, setRulesCode] = useState('');
  const [explanation, setExplanation] = useState('');
  const [error, setError] = useState('');
  const [pastedRules, setPastedRules] = useState('');
  const [selectedCollectionDoc, setSelectedCollectionDoc] = useState<{ collection: string; docId: string }>({ collection: 'users', docId: '{usersId}' });

  const [allowRules, setAllowRules] = useState<{ collection: string; docId: string; action: string; condition: string }[]>([]);
  const [fieldTypes, setFieldTypes] = useState<{ collection: string; docId: string; field: string; type: string }[]>([]);

  const collectionDocOptions = [
    { collection: 'users', docId: '{usersId}' },
    { collection: 'members', docId: '{membersId}' },
    { collection: 'families', docId: '{familiesId}' },
    { collection: 'chats', docId: '{chatsId}' },
  ];

  useEffect(() => {
    const storedRules = localStorage.getItem('generatedRules');
    const storedExplanation = localStorage.getItem('rulesExplanation') || '';
    console.log('[DEBUG] Initial Load - Rules:', storedRules);
    console.log('[DEBUG] Initial Load - Explanation:', storedExplanation);

    if (storedRules) {
      setRulesCode(storedRules);
      setExplanation(storedExplanation);
      const { allowRules: parsedAllowRules, fieldTypes: parsedFieldTypes } = parseRulesFromCode(storedRules);
      console.log('[DEBUG] Parsed Allow Rules:', parsedAllowRules);
      console.log('[DEBUG] Parsed Field Types:', parsedFieldTypes);
      setAllowRules(parsedAllowRules.map(rule => ({ ...rule, docId: rule.docId || `{${rule.collection}Id}` })));
      setFieldTypes(parsedFieldTypes.map(field => ({ ...field, docId: field.docId || `{${field.collection}Id}` })));
    } else {
      console.warn('[DEBUG] No rules in localStorage on initial load');
      setRulesCode('// No rules generated yet. Submit Firestore code on the previous page.');
      setExplanation('No explanation available. Generate rules first.');
      setAllowRules([]);
      setFieldTypes([]);
    }
  }, []);

  const parseRulesFromCode = (code: string) => {
    const allowRules: { collection: string; docId: string; action: string; condition: string }[] = [];
    const fieldTypes: { collection: string; docId: string; field: string; type: string }[] = [];
    const lines = code.split('\n').map(line => line.trim());
    let currentCollection = '';
    let currentDocId = '';

    for (let line of lines) {
      if (line.startsWith('match /')) {
        const match = line.match(/match \/(\w+)\/\{([^}]+)}/);
        if (match) {
          currentCollection = match[1];
          currentDocId = match[2];
        }
      } else if (line.startsWith('allow')) {
        const match = line.match(/allow\s+([\w,\s]+):\s*if\s+(.+);/);
        if (match && currentCollection && currentDocId) {
          const actions = match[1].split(',').map(a => a.trim()).join(', ');
          allowRules.push({ collection: currentCollection, docId: currentDocId, action: actions, condition: match[2].trim() });
        }
      } else if (line.startsWith('function schema() {')) {
        let inSchema = true;
        let schemaLines = [];
        let i = lines.indexOf(line) + 1;
        while (i < lines.length && !lines[i].includes('}')) {
          if (lines[i].includes(':')) schemaLines.push(lines[i]);
          i++;
        }
        schemaLines.forEach(schemaLine => {
          const [field, type] = schemaLine.split(':').map(s => s.trim().replace(/['",]/g, ''));
          if (field && type && currentCollection && currentDocId) {
            fieldTypes.push({ collection: currentCollection, docId: currentDocId, field, type });
          }
        });
      }
    }
    return { allowRules, fieldTypes };
  };

  const generateCode = () => {
    let code = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n`;
    const collections = [...new Set([...allowRules.map(r => r.collection), ...fieldTypes.map(f => f.collection)])];
    if (collections.length === 0) {
      code += `    // No collections defined\n`;
    } else {
      collections.forEach(collection => {
        code += `    match /${collection}/{${collection}Id} {\n`;
        const collectionAllowRules = allowRules.filter(r => r.collection === collection);
        if (collectionAllowRules.length > 0) {
          collectionAllowRules.forEach(rule => {
            code += `      allow ${rule.action}: if ${rule.condition};\n`;
          });
        } else {
          code += `      // No allow rules defined for ${collection}\n`;
        }
        const collectionFieldTypes = fieldTypes.filter(f => f.collection === collection);
        if (collectionFieldTypes.length > 0) {
          code += `\n      function schema() {\n        return {\n`;
          collectionFieldTypes.forEach(field => {
            if (field.field.trim()) code += `          ${field.field.trim()}: '${field.type}',\n`;
          });
          code += `        };\n      }\n`;
        } else {
          code += `      // No field types defined for ${collection}\n`;
        }
        code += `    }\n`;
      });
    }
    code += `  }\n}`;
    setRulesCode(code);
    localStorage.setItem('generatedRules', code);
    localStorage.setItem('rulesExplanation', explanation);
  };

  const handlePasteRules = () => {
    setError('');
    const newRules = pastedRules.trim();
    if (newRules) {
      setRulesCode(newRules);
      localStorage.setItem('generatedRules', newRules);
      const { allowRules: parsedAllowRules, fieldTypes: parsedFieldTypes } = parseRulesFromCode(newRules);
      setAllowRules(parsedAllowRules.map(rule => ({ ...rule, docId: rule.docId || `{${rule.collection}Id}` })));
      setFieldTypes(parsedFieldTypes.map(field => ({ ...field, docId: field.docId || `{${field.collection}Id}` })));
    } else {
      setError('Please paste valid rules.');
    }
  };

  const addAllowRule = () => setAllowRules([...allowRules, { collection: selectedCollectionDoc.collection, docId: selectedCollectionDoc.docId, action: 'read', condition: 'isAuthenticated' }]);
  const removeAllowRule = (i: number) => setAllowRules(allowRules.filter((_, idx) => idx !== i));
  const updateAllowRule = (i: number, key: string, value: string) => {
    const updated = [...allowRules];
    updated[i][key] = value;
    setAllowRules(updated);
  };

  const addFieldType = () => setFieldTypes([...fieldTypes, { collection: selectedCollectionDoc.collection, docId: selectedCollectionDoc.docId, field: '', type: 'string' }]);
  const removeFieldType = (i: number) => setFieldTypes(fieldTypes.filter((_, idx) => idx !== i));
  const updateFieldType = (i: number, key: string, value: string) => {
    const updated = [...fieldTypes];
    updated[i][key] = value;
    setFieldTypes(updated);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.container}>
        <div className={styles.leftPanel}>
          <div className={styles.dropdownContainer}>
            <select
              value={`${selectedCollectionDoc.collection}/${selectedCollectionDoc.docId}`}
              onChange={(e) => {
                const [collection, docId] = e.target.value.split('/');
                setSelectedCollectionDoc({ collection, docId });
              }}
              className={styles.dropdown}
            >
              {collectionDocOptions.map(option => (
                <option key={`${option.collection}/${option.docId}`} value={`${option.collection}/${option.docId}`}>
                  {option.collection}/{option.docId}
                </option>
              ))}
            </select>
          </div>
          <GuiView
            mode={mode}
            allowRules={allowRules.filter(rule => rule.collection === selectedCollectionDoc.collection && rule.docId === selectedCollectionDoc.docId)}
            fieldTypes={fieldTypes.filter(field => field.collection === selectedCollectionDoc.collection && field.docId === selectedCollectionDoc.docId)}
            addAllowRule={addAllowRule}
            removeAllowRule={removeAllowRule}
            updateAllowRule={updateAllowRule}
            addFieldType={addFieldType}
            removeFieldType={removeFieldType}
            updateFieldType={updateFieldType}
            functions={functions}
            types={types}
          />
        </div>
        <div className={styles.rightPanel}>
          <CodeView
            rulesCode={rulesCode}
            error={error}
            pastedRules={pastedRules}
            setPastedRules={setPastedRules}
            handlePasteRules={handlePasteRules}
          />
          <Explanation explanation={explanation} />
        </div>
      </div>
    </div>
  );
}

const collectionDocOptions = [
  { collection: 'users', docId: '{usersId}' },
  { collection: 'members', docId: '{membersId}' },
  { collection: 'families', docId: '{familiesId}' },
  { collection: 'chats', docId: '{chatsId}' },
];