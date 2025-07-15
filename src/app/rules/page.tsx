'use client';

import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import GuiView from '../components/GuiView';
import CodeView from '../components/CodeView';
import styles from './rules.module.css';
import Explanation from '../components/Explanation';

const functions = [
  { name: 'isOwner', description: 'Checks if the user ID matches the document owner ID.' },
  { name: 'isAuthenticated', description: 'Checks if the user is authenticated.' },
];

const types = ['string', 'number', 'boolean', 'timestamp', 'array', 'map'];

const READ_METHODS = ['get', 'list'];
const WRITE_METHODS = ['create', 'update', 'delete'];

export default function RulesPage() {
  const { generatedRules, rulesExplanation } = useAppSelector(state => state.reducer.rules);

  const [allRules, setAllRules] = useState<Record<string, { method: string[]; condition: string }[]>>({});
  const [selectedPath, setSelectedPath] = useState('');
  const [paths, setPaths] = useState<string[]>([]);
  const [codePreview, setCodePreview] = useState('');
  const [explanation, setExplanation] = useState('');

  // Parse rules from raw Firestore rules string
  const parseFirestoreRules = (rules: string) => {
    const pathRegex = /^\s*match\s+([^\s{]+)\s*\{/;
    const allowRegex = /^\s*allow\s+([a-z,\s]+):\s*if\s+(.+);/;
    const lines = rules.split('\n');

    const parsed: Record<string, { method: string[]; condition: string }[]> = {};
    const pathStack: string[] = [];
    let currentFullPath = '';

    lines.forEach(line => {
      const trimmedLine = line.trim();

      if (trimmedLine.startsWith('match')) {
        const match = trimmedLine.match(pathRegex);
        if (match) {
          pathStack.push(match[1]);
          currentFullPath = '/' + pathStack.join('/').replace(/\/+/g, '/').replace(/^\/+/, '');
        }
      } else if (trimmedLine.startsWith('allow')) {
        const allow = trimmedLine.match(allowRegex);
        if (allow) {
          const rawMethods = allow[1].split(',').map(m => m.trim());
          const condition = allow[2].trim();

          if (!parsed[currentFullPath]) parsed[currentFullPath] = [];
          parsed[currentFullPath].push({ method: Array.from(new Set(rawMethods)), condition });
        }
      } else if (trimmedLine.startsWith('}')) {
        pathStack.pop();
        currentFullPath = '/' + pathStack.join('/').replace(/\/+/g, '/').replace(/^\/+/, '');
      }
    });

    return parsed;
  };



  function buildNestedRuleTree(rulesObj: Record<string, { method: string[]; condition: string }[]>) {
    const tree: any = {};

    for (const fullPath in rulesObj) {
      // remove /databases/{database}/documents prefix
      const relativePath = fullPath.replace(/^\/?databases\/\{database\}\/documents/, '').replace(/^\/+/, '');
      const segments = relativePath.split('/').filter(Boolean);

      let current = tree;

      for (let i = 0; i < segments.length; i++) {
        const segment = segments[i];

        if (!current[segment]) {
          current[segment] = { __rules: [], __children: {} };
        }

        if (i === segments.length - 1) {
          current[segment].__rules = rulesObj[fullPath];
        }

        current = current[segment].__children;
      }
    }

    return tree;
  }

  function generateRulesString(rulesObj: Record<string, { method: string[]; condition: string }[]>) {
    const tree = buildNestedRuleTree(rulesObj);

    const renderTree = (node: any, path: string = '', indent: string = '    '): string => {
      let output = '';

      for (const [segment, data] of Object.entries(node)) {
        const currentPath = path ? `${path}/${segment}` : `/${segment}`;
        output += `${indent}match ${currentPath} {\n`;

        const grouped: Record<string, Set<string>> = {};

        for (const { method, condition } of data.__rules || []) {
          if (!grouped[condition]) grouped[condition] = new Set();
          method.forEach(m => grouped[condition].add(m));
        }

        for (const [condition, methodsSet] of Object.entries(grouped)) {
          const methods = Array.from(methodsSet).sort();
          let label = methods.join(', ');

          if (READ_METHODS.every(m => methods.includes(m)) && methods.length === 2) label = 'read';
          if (WRITE_METHODS.every(m => methods.includes(m)) && methods.length === 3) label = 'write';

          output += `${indent}  allow ${label}: if ${condition};\n`;
        }

        output += renderTree(data.__children, '', indent + '  ');
        output += `${indent}}\n`;
      }

      return output;
    };

    let output = `rules_version = '2';\nservice cloud.firestore {\n  match /databases/{database}/documents {\n`;
    output += renderTree(tree, '', '    ');
    output += `  }\n}`;

    return output;
  }


  useEffect(() => {
    if (generatedRules) {
      // const start = generatedRules.indexOf("rules_version = '2';");
      // const end = generatedRules.lastIndexOf('}');
      // const body = generatedRules.slice(start, end + 1);

      // const cleaned = body.split('\n').filter(line => !line.trim().startsWith('//')).join('\n');
      const start = generatedRules.indexOf("rules_version = '2';");
      let body = '';

      if (start !== -1) {
        const afterStart = generatedRules.slice(start);
        const lastBrace = afterStart.lastIndexOf('}');
        body = lastBrace !== -1 ? afterStart.slice(0, lastBrace + 1) : afterStart;
      }


      const cleaned = body
        .split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('//') && !line.startsWith('```'))
        .join('\n');

      const parsed = parseFirestoreRules(cleaned);
      console.log('[DEBUG] Cleaned Rules Block:', cleaned);


      // const rulePaths = Object.keys(parsed).filter(p => !p.startsWith('/databases/'));
      const rulePaths = Object.keys(parsed);
      setAllRules(parsed);
      setPaths(rulePaths);
      setSelectedPath(rulePaths[0] || '');
      setCodePreview(generateRulesString(parsed));
    }
  }, [generatedRules]);

  const updateAllowRule = (index: number, key: string, value: string | string[]) => {
    setAllRules(prev => {
      const updated = { ...prev };
      if (!updated[selectedPath]) return updated;

      const next = updated[selectedPath].map((rule, i) =>
        i === index ? { ...rule, [key]: value } : rule
      );

      updated[selectedPath] = next;
      return updated;
    });
  };

  const addAllowRule = () => {
    if (!selectedPath) return;
    setAllRules(prev => ({
      ...prev,
      [selectedPath]: [...(prev[selectedPath] || []), { method: ['get', 'list'], condition: '' }],
    }));
  };

  const removeAllowRule = (i: number) => {
    setAllRules(prev => {
      const updated = { ...prev };
      if (!updated[selectedPath]) return updated;
      updated[selectedPath] = updated[selectedPath].filter((_, idx) => idx !== i);
      return updated;
    });
  };

  useEffect(() => {
    setCodePreview(generateRulesString(allRules));
  }, [allRules]);


  console.log('generatedRules', generatedRules, allRules)

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h1>Firestore Rules Builder</h1>
      </div>
      <div className={styles.container}>
        <div className={styles.leftPanel}>
          {paths.length > 0 ? (
            <>
              <div className={styles.dropdownContainer}>
                <select
                  value={selectedPath}
                  onChange={(e) => setSelectedPath(e.target.value)}
                  className={styles.dropdown}
                >
                  {paths.map(path => (
                    <option key={path} value={path}>
                      {path}
                    </option>
                  ))}
                </select>

              </div>

              <GuiView
                mode="auth"
                allowRules={allRules[selectedPath] || []}
                fieldTypes={[]}
                addAllowRule={addAllowRule}
                removeAllowRule={removeAllowRule}
                updateAllowRule={(i, k, v) => updateAllowRule(i, k, v)}
                addFieldType={() => { }}
                removeFieldType={() => { }}
                updateFieldType={() => { }}
                functions={functions}
                types={types}
              />
            </>
          ) : (
            <div className={styles.noRules}>
              <p>No valid rules parsed.</p>
              <p>Generate rules from your Firestore code on the <a href="/">Home</a> page.</p>
            </div>

          )}
        </div>
        <div className={styles.rightPanel}>
          <CodeView
            rulesCode={codePreview}
            selectedPath={selectedPath}
            pastedRules={''}
            setPastedRules={() => { }}
            handlePasteRules={() => { }}
            error={''}
          />
          {rulesExplanation && (
            <Explanation explanation={rulesExplanation} />
          )}
        </div>
      </div>
    </div>
  );
}
